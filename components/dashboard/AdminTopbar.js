"use client";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export function AdminTopbar() {
  return (
    <div className="h-16 bg-white border-b border-brand-navy/10 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 mt-14 lg:mt-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-gold/15 text-brand-goldDark px-3 py-1 text-xs">
          <Shield size={12} /> Admin
        </span>
        <span className="hidden sm:inline text-brand-navy/60">Overview & management</span>
      </div>
      <Link href="/dashboard" className="btn btn-outline btn-sm">
        <ArrowLeft size={14} /> User Dashboard
      </Link>
    </div>
  );
}
