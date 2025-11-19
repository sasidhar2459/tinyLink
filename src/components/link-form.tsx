"use client";

import { useState, useEffect } from "react";
import { LinkIcon, ArrowRight, Loader2, QrCode, Download, X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatedItem {
  code: string;
  url: string;
  type: "link" | "qr";
}

interface LinkFormProps {
  activeType?: "link" | "qr";
  onTypeChange?: (type: "link" | "qr") => void;
}

export function LinkForm({ activeType, onTypeChange }: LinkFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createType, setCreateType] = useState<"link" | "qr">(activeType || "link");
  const [createdItem, setCreatedItem] = useState<CreatedItem | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Sync internal state with prop
  useEffect(() => {
    if (activeType) {
      setCreateType(activeType);
    }
  }, [activeType]);

  // Generate QR code image from the short code
  const generateQRCodeImage = async (shortCode: string) => {
    try {
      const QRCode = (await import('qrcode')).default;
      const shortUrl = `${window.location.origin}/${shortCode}`;
      const qrDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
      });
      setQrCodeImage(qrDataUrl);
    } catch (err) {
      console.error("Failed to generate QR code image:", err);
    }
  };

  // Handle copying short link
  const handleCopyShortLink = async () => {
    if (!createdItem) return;
    const shortUrl = `${window.location.origin}/${createdItem.code}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Handle downloading QR code
  const handleDownloadQR = () => {
    if (!qrCodeImage) return;
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `qr-code-${createdItem?.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  // Handle creating another
  const handleCreateAnother = () => {
    setCreatedItem(null);
    setQrCodeImage("");
    setCopied(false);
    // Reload to show new item in list
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setCreatedItem(null);
    setQrCodeImage("");
    setCopied(false);
    // Reload to show new item in list
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const apiEndpoint = createType === "link" ? "/api/links" : "/api/qr-codes";
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          code: code || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to create ${createType}`);
        toast.error(data.error || `Failed to create ${createType}`);
        return;
      }

      setSuccess(true);

      // Set the created item to show in modal
      setCreatedItem({
        code: data.code,
        url: data.url,
        type: createType
      });

      // If it's a QR code, generate the QR code image
      if (createType === "qr") {
        await generateQRCodeImage(data.code);
      }

      setUrl("");
      setCode("");
      toast.success(`${createType === "link" ? "Link" : "QR Code"} created successfully!`);
    } catch (err) {
      setError(`Failed to create ${createType}. Please try again.`);
      toast.error(`Failed to create ${createType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      {/* Toggle between Link and QR Code */}
      <div className="mb-4 sm:mb-6 flex gap-2 p-1 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => {
            setCreateType("link");
            onTypeChange?.("link");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            createType === "link"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Create Link</span>
          <span className="sm:hidden">Link</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setCreateType("qr");
            onTypeChange?.("qr");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            createType === "qr"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Create QR Code</span>
          <span className="sm:hidden">QR</span>
        </button>
      </div>

      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          {createType === "link" ? "Quick create" : "Create QR Code"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {createType === "link"
            ? "Enter your long URL to create a shortened TinyLink."
            : "Enter your URL to generate a scannable QR code."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="url"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Destination URL
          </label>
          <div className="relative">
            <input
              id="url"
              type="url"
              placeholder="https://example.com/my-long-url"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-testid="url-input"
              required
            />
          </div>
        </div>

      

        {error && (
          <div
            className="rounded-md bg-red-50 p-3 text-sm text-red-500"
            data-testid="error-message"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="rounded-md bg-green-50 p-3 text-sm text-green-600"
            data-testid="success-message"
          >
            Link created successfully!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            data-testid="submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create TinyLink"
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {createdItem && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[340px] sm:max-w-md mx-auto overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-5 md:p-6 text-center">
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white hover:text-blue-100 bg-white/20 hover:bg-white/30 rounded-full p-1.5 sm:p-2 transition-all border-2 border-white/50 hover:border-white/70 shadow-lg"
                aria-label="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
              </button>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center gap-2 flex-wrap">
                Your {createdItem.type === "link" ? "Bitly" : "Bitly"} Link is ready{" "}
                <span className="text-xl sm:text-2xl md:text-3xl">🎉</span>
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 sm:mt-2">
                {createdItem.type === "qr"
                  ? "Scan the image below to preview your code"
                  : "Your short link is ready to share"}
              </p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 md:p-6">
              {createdItem.type === "qr" ? (
                // QR Code Display
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-center bg-white p-3 sm:p-4 rounded-lg border-2 border-slate-100">
                    {qrCodeImage ? (
                      <img src={qrCodeImage} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64" />
                    ) : (
                      <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadQR}
                    disabled={!qrCodeImage}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    Download PNG
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyShortLink}
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2.5 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy code
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // Link Display
                <div className="space-y-3 sm:space-y-4">
                  {/* Short Link Display */}
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Your short link</p>
                    <p className="text-base sm:text-lg font-semibold text-blue-600 break-all">
                      {window.location.origin}/{createdItem.code}
                    </p>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyShortLink}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        Copied to clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                        Copy link
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Create Another Link */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-slate-600 mb-2">On a roll? Don't stop now!</p>
                <button
                  onClick={handleCreateAnother}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm inline-flex items-center gap-1"
                >
                  Create another {createdItem.type === "qr" ? "QR Code" : "Link"}
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
