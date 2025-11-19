"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Calendar, SlidersHorizontal, List, LayoutGrid, MoreHorizontal, Edit, Share2, BarChart3, Link as LinkIcon, Copy, Trash2, QrCode, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface LinkData {
  id: string;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editCode, setEditCode] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState<string | null>(null);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchLinks();

    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchLinks();
    }, 5000);

    return () => clearInterval(interval);
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

  const handleEdit = (link: LinkData) => {
    setEditingLink(link);
    setEditUrl(link.url);
    setEditCode(link.code);
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;

    try {
      const response = await fetch(`/api/links/${editingLink.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: editUrl, newCode: editCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update link");
      }

      const updatedLink = await response.json();
      setLinks(links.map(link => link.code === editingLink.code ? updatedLink : link));
      setEditingLink(null);
      setEditUrl("");
      setEditCode("");
      toast.success("Link updated successfully!");
      fetchLinks(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || "Failed to update link. Please try again.");
    }
  };

  // Filter links based on search query and date
  const filteredLinks = links.filter(link => {
    const matchesSearch = link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!dateFilter) return matchesSearch;

    // Format date as DD/MM/YYYY for comparison
    const linkDate = new Date(link.createdAt);
    const linkDateStr = `${String(linkDate.getDate()).padStart(2, '0')}/${String(linkDate.getMonth() + 1).padStart(2, '0')}/${linkDate.getFullYear()}`;

    return matchesSearch && linkDateStr === dateFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLinks = filteredLinks.slice(startIndex, endIndex);

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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Tiny Links</h1>
        <Link
          href="/?tab=link"
          className="rounded-md bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
        >
          Create link
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search links"
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

    

      {/* Links List */}
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
            <p className="text-sm text-slate-500">Loading links...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      ) : links.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3">
              <LinkIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">No links yet</h3>
            <p className="mt-1 text-sm text-slate-500">Create your first short link to get started.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 bg-white">
            {currentLinks.map((link) => {
            const shortUrl = `tinylink.com/${link.code}`;
            const domain = new URL(link.url).hostname;
            return (
              <div key={link.id} className="border-b border-slate-100 last:border-0 p-4 sm:p-6 hover:bg-slate-50">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded bg-blue-100">
                        <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{domain}</h3>
                    </div>
                    <div className="mb-2 ml-9 sm:ml-11 flex items-center gap-2">
                      <a
                        href={`/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-medium text-blue-600 hover:underline cursor-pointer break-all"
                      >
                        {shortUrl}
                      </a>
                      <button
                        onClick={() => handleCopy(link.code)}
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                        title="Copy link"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="ml-9 sm:ml-11 flex items-start gap-2 text-xs sm:text-sm text-slate-500">
                      <LinkIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-words hover:underline cursor-pointer line-clamp-2"
                      >
                        {link.url}
                      </a>
                    </div>
                    <div className="ml-9 sm:ml-11 mt-2 sm:mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {link.clicks} clicks
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                      {link.lastClicked && (
                        <span className="text-slate-400 text-xs">
                          Last: {new Date(link.lastClicked).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-end sm:justify-start">
                    <button
                      onClick={() => handleEdit(link)}
                      className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `TinyLink - ${link.code}`,
                            url: `${window.location.origin}/${link.code}`
                          });
                        } else {
                          handleCopy(link.code);
                        }
                      }}
                      className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                    </button>
                    <Link
                      href={`/analytics/${link.code}`}
                      className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                      title="Analytics"
                    >
                      <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setShowMoreOptions(showMoreOptions === link.code ? null : link.code)}
                        className="rounded-md p-2 hover:bg-slate-100 flex-shrink-0"
                        title="More options"
                      >
                        <MoreHorizontal className="h-4 w-4 sm:h-4 sm:w-4 text-slate-600" />
                      </button>
                      {showMoreOptions === link.code && (
                        <div className="absolute right-0 mt-2 w-40 sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowMoreOptions(null);
                                handleDelete(link.code);
                              }}
                              className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Delete Link
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
          {filteredLinks.length > itemsPerPage && (
            <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLinks.length)} of {filteredLinks.length} links
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

      {/* Edit Modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-[340px] sm:max-w-md w-full">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Edit Link</h2>
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
            <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setEditingLink(null);
                  setEditUrl("");
                  setEditCode("");
                }}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLink}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Update Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
