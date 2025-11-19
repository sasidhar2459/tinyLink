"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LinkIcon, BarChart2, Settings, FileText, QrCode } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-full flex-col justify-between py-4">
      <div className="px-4">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-bold">
            T
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">TinyLink</span>
        </div>

        <nav className="space-y-1">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            data-testid="nav-home"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/links"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/links")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            data-testid="nav-links"
          >
            <LinkIcon className="h-4 w-4" />
            Links
          </Link>
          <Link
            href="/qr-codes"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/qr-codes")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            data-testid="nav-qr-codes"
          >
            <QrCode className="h-4 w-4" />
            QR Codes
          </Link>
   
          <Link
            href="/analytics"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/analytics")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            data-testid="nav-analytics"
          >
            <BarChart2 className="h-4 w-4" />
            Analytics
          </Link>
        </nav>
      </div>

      <div className="px-4">
        <div className="border-t pt-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/settings")
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            data-testid="nav-settings"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
