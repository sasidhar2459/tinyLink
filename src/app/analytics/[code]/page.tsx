"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Link as LinkIcon, MousePointerClick, Calendar, ExternalLink, Copy, Loader2 } from 'lucide-react';

interface LinkData {
  id: string;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function LinkAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [link, setLink] = useState<LinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (code) {
      fetchLinkData();

      // Auto-refresh every 5 seconds for real-time updates
      const interval = setInterval(() => {
        fetchLinkData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [code]);

  const fetchLinkData = async () => {
    try {
      const response = await fetch(`/api/links/${code}`);
      if (!response.ok) {
        throw new Error("Failed to fetch link data");
      }
      const data = await response.json();
      setLink(data);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load link analytics");
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    const shortUrl = `${window.location.origin}/${link.code}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="space-y-6">
        <Link href="/links" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Links
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-red-500">{error || "Link not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const shortUrl = `tinylink.com/${link.code}`;
  const domain = new URL(link.url).hostname;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/links" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Links
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{domain}</h1>
            <div className="flex items-center gap-3">
              <a
                href={`/${link.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-600 hover:underline cursor-pointer"
              >
                {shortUrl}
              </a>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-slate-600"
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-blue-100 p-2">
              <MousePointerClick className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Clicks</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{link.clicks}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-green-100 p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Created</h3>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {new Date(link.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-slate-500">
            {new Date(link.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-purple-100 p-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Last Clicked</h3>
          </div>
          {link.lastClicked ? (
            <>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(link.lastClicked).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(link.lastClicked).toLocaleTimeString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Never clicked</p>
          )}
        </div>
      </div>

      {/* Link Details */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Link Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Short Code</label>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-slate-100 px-3 py-2 rounded-md font-mono text-slate-900">
                {link.code}
              </code>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Destination URL</label>
            <div className="flex items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline cursor-pointer break-all"
              >
                {link.url}
              </a>
              <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Short URL</label>
            <div className="flex items-center gap-2">
              <a
                href={`/${link.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                {window.location.origin}/{link.code}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Note */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
        <p className="text-sm text-slate-700">
          Analytics updates in real-time. Click count and last clicked time refresh every 5 seconds.
        </p>
      </div>
    </div>
  );
}
