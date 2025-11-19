"use client";

import { useState, useEffect } from 'react';
import { Link as LinkIcon, QrCode, MousePointer, TrendingUp, Calendar, BarChart3, Loader2 } from 'lucide-react';

interface LinkData {
  code: string;
  clicks: number;
  url: string;
}

interface QRCodeData {
  code: string;
  scans: number;
  url: string;
}

interface AnalyticsData {
  totalEngagements: number;
  totalLinkClicks: number;
  totalQRScans: number;
  totalLinks: number;
  totalQRCodes: number;
  topLinks: LinkData[];
  topQRCodes: QRCodeData[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [linksRes, qrCodesRes] = await Promise.all([
        fetch('/api/links'),
        fetch('/api/qr-codes')
      ]);

      const links = await linksRes.json();
      const qrCodes = await qrCodesRes.json();

      const totalLinkClicks = links.reduce((sum: number, link: any) => sum + link.clicks, 0);
      const totalQRScans = qrCodes.reduce((sum: number, qr: any) => sum + qr.scans, 0);
      const totalEngagements = totalLinkClicks + totalQRScans;

      // Get top 5 performing links and QR codes
      const topLinks = [...links]
        .sort((a: any, b: any) => b.clicks - a.clicks)
        .slice(0, 5);

      const topQRCodes = [...qrCodes]
        .sort((a: any, b: any) => b.scans - a.scans)
        .slice(0, 5);

      setAnalytics({
        totalEngagements,
        totalLinkClicks,
        totalQRScans,
        totalLinks: links.length,
        totalQRCodes: qrCodes.length,
        topLinks,
        topQRCodes
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const maxEngagement = Math.max(
    analytics?.totalLinkClicks || 0,
    analytics?.totalQRScans || 0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Track your links and QR codes performance</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Engagements */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium text-slate-600">Total Engagements</p>
            <MousePointer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1">
            {analytics?.totalEngagements.toLocaleString() || 0}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            {analytics?.totalLinkClicks || 0} clicks + {analytics?.totalQRScans || 0} scans
          </p>
        </div>

        {/* Total Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium text-slate-600">Links</p>
            <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1">
            {analytics?.totalLinks || 0}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            {analytics?.totalLinkClicks || 0} total clicks
          </p>
        </div>

        {/* Total QR Codes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium text-slate-600">QR Codes</p>
            <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1">
            {analytics?.totalQRCodes || 0}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            {analytics?.totalQRScans || 0} total scans
          </p>
        </div>
      </div>

      {/* Engagement Distribution Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">Engagement Distribution</h3>
        <div className="space-y-4">
          {/* Links Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Link Clicks</span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {analytics?.totalLinkClicks || 0}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${maxEngagement > 0 ? ((analytics?.totalLinkClicks || 0) / maxEngagement) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* QR Codes Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">QR Code Scans</span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {analytics?.totalQRScans || 0}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${maxEngagement > 0 ? ((analytics?.totalQRScans || 0) / maxEngagement) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Top Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Top Links</h3>
          </div>
          {analytics?.topLinks && analytics.topLinks.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {analytics.topLinks.map((link, index) => (
                <div key={link.code} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-slate-50 overflow-hidden">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-green-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                      tinylink.com/{link.code}
                    </p>
                    <p className="text-xs text-slate-500 break-words line-clamp-2 overflow-wrap-anywhere">{link.url}</p>
                  </div>
                  <div className="flex-shrink-0 text-right min-w-[60px]">
                    <p className="text-base sm:text-lg font-bold text-slate-900">{link.clicks}</p>
                    <p className="text-xs text-slate-500">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 text-center py-8">No links yet</p>
          )}
        </div>

        {/* Top QR Codes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Top QR Codes</h3>
          </div>
          {analytics?.topQRCodes && analytics.topQRCodes.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {analytics.topQRCodes.map((qr, index) => (
                <div key={qr.code} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-slate-50 overflow-hidden">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-purple-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                      tinylink.com/{qr.code}
                    </p>
                    <p className="text-xs text-slate-500 break-words line-clamp-2 overflow-wrap-anywhere">{qr.url}</p>
                  </div>
                  <div className="flex-shrink-0 text-right min-w-[60px]">
                    <p className="text-base sm:text-lg font-bold text-slate-900">{qr.scans}</p>
                    <p className="text-xs text-slate-500">scans</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 text-center py-8">No QR codes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
