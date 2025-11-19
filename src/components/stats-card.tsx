"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MousePointer2, Globe, Copy, Loader2 } from 'lucide-react';

interface StatsCardProps {
  code: string;
}

interface LinkData {
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

interface QRCodeData {
  code: string;
  url: string;
  scans: number;
  lastScanned: string | null;
  createdAt: string;
}

type ItemData = (LinkData & { type: "link" }) | (QRCodeData & { type: "qr" });

export function StatsCard({ code }: StatsCardProps) {
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItemData();
  }, [code]);

  const fetchItemData = async () => {
    try {
      // Try to fetch as a link first
      const linkResponse = await fetch(`/api/links/${code}`);
      if (linkResponse.ok) {
        const data = await linkResponse.json();
        setItemData({ ...data, type: "link" });
        return;
      }

      // If not a link, try as a QR code
      const qrResponse = await fetch(`/api/qr-codes/${code}`);
      if (qrResponse.ok) {
        const data = await qrResponse.json();
        setItemData({ ...data, type: "qr" });
        return;
      }

      // Neither found
      setError("Item not found");
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const shortUrl = `${window.location.origin}/${code}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
        <p className="text-sm text-slate-500">Loading stats...</p>
      </div>
    );
  }

  if (error || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500 mb-4">{error || "Item not found"}</p>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isLink = itemData.type === "link";
  const engagementCount = isLink ? (itemData as LinkData).clicks : (itemData as QRCodeData).scans;
  const lastEngagement = isLink ? (itemData as LinkData).lastClicked : (itemData as QRCodeData).lastScanned;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isLink ? "Link" : "QR Code"} Statistics</h1>
          <p className="text-slate-500">Detailed performance for /{code}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-testid="stats-container">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <MousePointer2 className="h-4 w-4" />
            <span className="text-sm font-medium">Total {isLink ? "Clicks" : "Scans"}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900" data-testid="stats-clicks">
            {engagementCount.toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Last {isLink ? "Clicked" : "Scanned"}</span>
          </div>
          <div className="text-lg font-medium text-slate-900" data-testid="stats-lastclicked">
            {lastEngagement ? new Date(lastEngagement).toLocaleDateString() : "Never"}
          </div>
          {lastEngagement && (
            <div className="text-xs text-slate-400">
              {new Date(lastEngagement).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Created</span>
          </div>
          <div className="text-lg font-medium text-slate-900" data-testid="stats-created">
            {new Date(itemData.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <div className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-medium text-green-700">
            Active
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">{isLink ? "Link" : "QR Code"} Details</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">Short Link</label>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="flex-1 text-sm text-slate-900" data-testid="stats-code">
                tinylink.com/{itemData.code}
              </span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-blue-600">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-500">Destination URL</label>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="flex-1 truncate text-sm text-slate-900" data-testid="stats-url">
                {itemData.url}
              </span>
              <a
                href={itemData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
