"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Search, Calendar, SlidersHorizontal, Download, MoreHorizontal, Edit, BarChart3, Loader2, QrCode as QrCodeIcon, Share2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodeData {
  id: string;
  code: string;
  url: string;
  scans: number;
  lastScanned: string | null;
  createdAt: string;
}

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState<string | null>(null);
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editCode, setEditCode] = useState("");
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const itemsPerPage = 3;

  useEffect(() => {
    fetchLinks();

    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchLinks();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate QR codes for all QR codes
    qrCodes.forEach(qrCode => {
      const canvas = canvasRefs.current[qrCode.code];
      if (canvas) {
        const shortUrl = `${window.location.origin}/${qrCode.code}`;
        QRCode.toCanvas(canvas, shortUrl, {
          width: 128,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    });
  }, [qrCodes]);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/qr-codes");
      if (!response.ok) {
        throw new Error("Failed to fetch QR codes");
      }
      const data = await response.json();
      setQRCodes(data);
    } catch (err) {
      setError("Failed to load QR codes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (code: string) => {
    const canvas = canvasRefs.current[code];
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `qr-code-${code}.png`;
      link.href = url;
      link.click();
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

      setQRCodes(qrCodes.filter(qr => qr.code !== code));
      toast.success("QR code deleted successfully!");
      setShowMoreOptions(null);
    } catch (err) {
      toast.error("Failed to delete QR code. Please try again.");
    }
  };

  const handleShare = async (code: string) => {
    const shortUrl = `${window.location.origin}/${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TinyLink QR Code - ${code}`,
          url: shortUrl
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shortUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleEdit = (qr: QRCodeData) => {
    setEditingQR(qr);
    setEditUrl(qr.url);
    setEditCode(qr.code);
  };

  const handleUpdateQR = async () => {
    if (!editingQR) return;

    try {
      const response = await fetch(`/api/qr-codes/${editingQR.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: editUrl, newCode: editCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update QR code");
      }

      const updatedQR = await response.json();
      setQRCodes(qrCodes.map(qr => qr.code === editingQR.code ? updatedQR : qr));
      setEditingQR(null);
      setEditUrl("");
      setEditCode("");
      toast.success("QR code updated successfully!");
      fetchLinks(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || "Failed to update QR code. Please try again.");
    }
  };

  // Filter QR codes based on search query and date
  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = qr.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!dateFilter) return matchesSearch;

    // Format date as DD/MM/YYYY for comparison
    const qrDate = new Date(qr.createdAt);
    const qrDateStr = `${String(qrDate.getDate()).padStart(2, '0')}/${String(qrDate.getMonth() + 1).padStart(2, '0')}/${qrDate.getFullYear()}`;

    return matchesSearch && qrDateStr === dateFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredQRCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQRCodes = filteredQRCodes.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">QR Codes</h1>
        <Link
          href="/?tab=qr"
          className="rounded-md bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
        >
          Create code
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search codes"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="date"
          onChange={(e) => {
            if (e.target.value) {
              const date = new Date(e.target.value);
              const formatted = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              setDateFilter(formatted);
              setCurrentPage(1);
            } else {
              setDateFilter("");
              setCurrentPage(1);
            }
          }}
          className="w-full sm:w-auto rounded-md border border-slate-200 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

  

      {/* QR Codes List */}
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
            <p className="text-sm text-slate-500">Loading QR codes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      ) : qrCodes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3">
              <QrCodeIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">No QR codes yet</h3>
            <p className="mt-1 text-sm text-slate-500">Create your first link to generate a QR code.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 bg-white">
            {currentQRCodes.map((qrCode) => {
              const shortUrl = `tinylink.com/${qrCode.code}`;
              const domain = new URL(qrCode.url).hostname;
              return (
                <div key={qrCode.id} className="border-b border-slate-100 last:border-0 p-4 sm:p-6 hover:bg-slate-50">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* QR Code Image */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded border border-slate-200 bg-white p-2 flex items-center justify-center overflow-hidden">
                        <canvas
                          ref={(el) => { canvasRefs.current[qrCode.code] = el; }}
                          className="max-w-full max-h-full"
                          style={{ width: '112px', height: '112px' }}
                        />
                      </div>
                    </div>

                    {/* QR Code Details */}
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">{domain}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">Website</p>
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                        <span className="flex-shrink-0 mt-0.5">↱</span>
                        <a
                          href={qrCode.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words hover:underline cursor-pointer line-clamp-2"
                        >
                          {qrCode.url}
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {qrCode.scans} scans
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {new Date(qrCode.createdAt).toLocaleDateString()}
                        </span>
                        <a
                          href={`/${qrCode.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline cursor-pointer break-all"
                        >
                          {shortUrl}
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-end sm:justify-start">
                      <button
                        onClick={() => handleEdit(qrCode)}
                        className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDownload(qrCode.code)}
                        className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                        title="Download"
                      >
                        <Download className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleShare(qrCode.code)}
                        className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowMoreOptions(showMoreOptions === qrCode.code ? null : qrCode.code)}
                          className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                          title="More options"
                        >
                          <MoreHorizontal className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                        </button>
                        {showMoreOptions === qrCode.code && (
                          <div className="absolute right-0 mt-2 w-40 sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleDelete(qrCode.code)}
                                className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Delete QR Code
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {filteredQRCodes.length > itemsPerPage && (
            <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredQRCodes.length)} of {filteredQRCodes.length} QR codes
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal with Live QR Preview */}
      {editingQR && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-[340px] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Edit QR Code</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Form Section */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Short Code
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="[A-Za-z0-9]{6,8}"
                    minLength={6}
                    maxLength={8}
                    title="6-8 alphanumeric characters"
                  />
                  <p className="text-xs text-slate-500 mt-1">6-8 alphanumeric characters</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Live QR Preview Section */}
              <div className="flex flex-col items-center justify-center order-first sm:order-last">
                <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">Live Preview</p>
                <div className="h-40 w-40 sm:h-48 sm:w-48 rounded border-2 border-slate-200 bg-white p-2 sm:p-3 flex items-center justify-center">
                  <LiveQRPreview url={editUrl} code={editCode} />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  QR code updates as you type
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setEditingQR(null);
                  setEditUrl("");
                  setEditCode("");
                }}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQR}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Update QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Live QR Code Preview Component
function LiveQRPreview({ url, code }: { url: string; code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && url && code) {
      const shortUrl = `${window.location.origin}/${code}`;
      QRCode.toCanvas(canvas, shortUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(err => console.error('QR generation error:', err));
    }
  }, [url, code]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
