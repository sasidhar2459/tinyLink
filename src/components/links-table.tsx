"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Trash2, ExternalLink, BarChart2, LinkIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface LinkData {
  id: string;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export function LinksTable() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }
      const data = await response.json();
      setLinks(data);
    } catch (err) {
      setError("Failed to load links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      // Remove from local state
      setLinks(links.filter(link => link.code !== code));
      toast.success("Link deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete link. Please try again.");
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
          <p className="text-sm text-slate-500">Loading links...</p>
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
  const totalPages = Math.ceil(links.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLinks = links.slice(startIndex, endIndex);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Recent Links</h3>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm" data-testid="links-table">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Short Link</th>
              <th className="px-6 py-3 font-medium">Original URL</th>
              <th className="px-6 py-3 font-medium">Clicks</th>
              <th className="px-6 py-3 font-medium">Last Clicked</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentLinks.map((link) => (
              <tr key={link.code} className="group hover:bg-slate-50" data-testid={`link-row-${link.code}`}>
                <td className="px-6 py-4 font-medium text-blue-600">
                  <div className="flex items-center gap-2">
                    <span data-testid={`link-code-${link.code}`}>tinylink.com/{link.code}</span>
                    <button
                      onClick={() => handleCopy(link.code)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-blue-600"
                      title="Copy"
                      data-testid={`copy-button-${link.code}`}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex max-w-[300px] items-center gap-2 text-slate-600">
                    <span className="truncate" data-testid={`link-url-${link.code}`}>
                      {link.url}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-slate-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4" data-testid={`link-clicks-${link.code}`}>
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-slate-400" />
                    {link.clicks}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500" data-testid={`link-lastclicked-${link.code}`}>
                  {link.lastClicked ? new Date(link.lastClicked).toLocaleDateString() : "Never"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(link.code)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-100"
                    data-testid={`delete-button-${link.code}`}
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
        {currentLinks.map((link) => (
          <div key={link.code} className="p-4 hover:bg-slate-50" data-testid={`link-row-${link.code}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-600 truncate" data-testid={`link-code-${link.code}`}>
                    tinylink.com/{link.code}
                  </span>
                  <button
                    onClick={() => handleCopy(link.code)}
                    className="flex-shrink-0 text-slate-400 hover:text-blue-600"
                    title="Copy"
                    data-testid={`copy-button-${link.code}`}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 truncate" data-testid={`link-url-${link.code}`}>
                    {link.url}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleDelete(link.code)}
                className="flex-shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-100"
                data-testid={`delete-button-${link.code}`}
              >
                Delete
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5" data-testid={`link-clicks-${link.code}`}>
                <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{link.clicks} clicks</span>
              </div>
              <div data-testid={`link-lastclicked-${link.code}`}>
                Last: {link.lastClicked ? new Date(link.lastClicked).toLocaleDateString() : "Never"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state">
          <div className="mb-3 rounded-full bg-slate-100 p-3">
            <LinkIcon className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-900">No links yet</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first short link above.</p>
        </div>
      )}

      {/* Pagination */}
      {links.length > itemsPerPage && (
        <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-500">
            Showing {startIndex + 1} to {Math.min(endIndex, links.length)} of {links.length} links
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
  );
}
