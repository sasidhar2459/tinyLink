"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LinkForm } from "@/components/link-form";
import { LinksTable } from "@/components/links-table";
import { QRCodesTable } from "@/components/qr-codes-table";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeType, setActiveType] = useState<"link" | "qr">("link");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "qr" || tab === "link") {
      setActiveType(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Your Connections Platform</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Manage your links and view performance analytics.</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <LinkForm activeType={activeType} onTypeChange={setActiveType} />
        {activeType === "link" ? <LinksTable /> : <QRCodesTable />}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
