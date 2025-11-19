"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Trash2, ExternalLink, BarChart2, QrCode as QrCodeIcon, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodeData {
  id: string;
  code: string;
  url: string;
  scans: number;
  lastScanned: string | null;
  createdAt: string;
}

export function QRCodesTable() {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [qrCodeImages, setQrCodeImages] = useState<Record<string, string>>({});
  const [enlargedQR, setEnlargedQR] = useState<{ code: string; image: string } | null>(null);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qr-codes");
      if (!response.ok) {
        throw new Error("Failed to fetch QR codes");
      }
      const data = await response.json();
      setQRCodes(data);

      // Generate QR code images for all codes
      await generateQRCodeImages(data);
    } catch (err) {
      setError("Failed to load QR codes");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCodeImages = async (codes: QRCodeData[]) => {
    try {
      const QRCode = (await import('qrcode')).default;
      const images: Record<string, string> = {};

      for (const qr of codes) {
        const shortUrl = `${window.location.origin}/${qr.code}`;
        const qrDataUrl = await QRCode.toDataURL(shortUrl, {
          width: 80,
          margin: 1,
        });
        images[qr.code] = qrDataUrl;
      }

      setQrCodeImages(images);
    } catch (err) {
      console.error("Failed to generate QR code images:", err);
    }
  };

  const enlargeQRCode = async (code: string) => {
    try {
      const QRCode = (await import('qrcode')).default;
      const shortUrl = `${window.location.origin}/${code}`;
      const qrDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 400,
        margin: 2,
      });
      setEnlargedQR({ code, image: qrDataUrl });
    } catch (err) {
      console.error("Failed to generate enlarged QR code:", err);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) {
      return;
    }

    try {
      const response = await fetch(`/api/qr-codes/${code}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete QR code");
      }

      // Remove from local state
      setQRCodes(qrCodes.filter(qr => qr.code !== code));
      toast.success("QR code deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete QR code. Please try again.");
    }
  };

  const handleCopy = async (code: string) => {
    const shortUrl = `${window.location.origin}/${code}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-12" data-testid="loading-state">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-12" data-testid="error-message">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(qrCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQRCodes = qrCodes.slice(startIndex, endIndex);

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Recent QR Codes</h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm" data-testid="qr-codes-table">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">QR Code</th>
                <th className="px-6 py-3 font-medium">Short Link</th>
                <th className="px-6 py-3 font-medium">Scans</th>
                <th className="px-6 py-3 font-medium">Last Scanned</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentQRCodes.map((qr) => (
              <tr key={qr.code} className="group hover:bg-slate-50" data-testid={`qr-row-${qr.code}`}>
                <td className="px-6 py-4">
                  <button
                    onClick={() => enlargeQRCode(qr.code)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    <QrCodeIcon className="h-4 w-4" />
                    View QR Code
                  </button>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  <span data-testid={`qr-code-${qr.code}`}>tinylink.com/{qr.code}</span>
                </td>
                <td className="px-6 py-4" data-testid={`qr-scans-${qr.code}`}>
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-slate-400" />
                    {qr.scans}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500" data-testid={`qr-lastscanned-${qr.code}`}>
                  {qr.lastScanned ? new Date(qr.lastScanned).toLocaleDateString() : "Never"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(qr.code)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-100"
                    data-testid={`delete-button-${qr.code}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {currentQRCodes.map((qr) => (
          <div key={qr.code} className="p-4 hover:bg-slate-50" data-testid={`qr-row-${qr.code}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-900 block mb-1" data-testid={`qr-code-${qr.code}`}>
                  tinylink.com/{qr.code}
                </span>
                <button
                  onClick={() => enlargeQRCode(qr.code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <QrCodeIcon className="h-3.5 w-3.5" />
                  View QR Code
                </button>
              </div>
              <button
                onClick={() => handleDelete(qr.code)}
                className="flex-shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-100"
                data-testid={`delete-button-${qr.code}`}
              >
                Delete
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5" data-testid={`qr-scans-${qr.code}`}>
                <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{qr.scans} scans</span>
              </div>
              <div data-testid={`qr-lastscanned-${qr.code}`}>
                Last: {qr.lastScanned ? new Date(qr.lastScanned).toLocaleDateString() : "Never"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {qrCodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state">
          <div className="mb-3 rounded-full bg-slate-100 p-3">
            <QrCodeIcon className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-900">No QR codes yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first QR code above.</p>
        </div>
      )}

      {/* Pagination */}
      {qrCodes.length > itemsPerPage && (
        <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-500">
            Showing {startIndex + 1} to {Math.min(endIndex, qrCodes.length)} of {qrCodes.length} QR codes
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Enlarged QR Code Modal */}
    {enlargedQR && (
      <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEnlargedQR(null)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
            <button
              onClick={() => setEnlargedQR(null)}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">QR Code</h2>
            <p className="text-blue-100 text-sm mt-1">tinylink.com/{enlargedQR.code}</p>
          </div>
          <div className="p-6">
            <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-slate-100">
              <img src={enlargedQR.image} alt="Enlarged QR Code" className="w-full max-w-sm" />
            </div>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = enlargedQR.image;
                link.download = `qr-code-${enlargedQR.code}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("QR code downloaded!");
              }}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
