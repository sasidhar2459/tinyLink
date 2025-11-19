import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TinyLink - URL Shortener",
  description: "Shorten URLs, view click statistics, and manage links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-slate-900 antialiased`}>
        <Toaster position="top-right" />
        <div className="flex h-screen w-full overflow-hidden">
          {/* Sidebar - Fixed on Desktop */}
          <aside className="hidden w-64 flex-col border-r bg-white md:flex">
            <Sidebar />
          </aside>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto max-w-6xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
