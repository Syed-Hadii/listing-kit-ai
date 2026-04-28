"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-brand-cream/80 backdrop-blur-lg border-b border-brand-navy/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="Listing Kit AI"
            className="h-14 w-auto"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-navy/80">
          <a href="/#how" className="hover:text-brand-navy">
            How it works
          </a>
          <a href="/#what" className="hover:text-brand-navy">
            What it makes
          </a>
          <Link href="/pricing" className="hover:text-brand-navy">
            Pricing
          </Link>
          <a href="/#faq" className="hover:text-brand-navy">
            FAQ
          </a>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-gold">
            Start Free
          </Link>
        </div>
        <button
          className="md:hidden p-2 text-brand-navy"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-brand-navy/10 px-4 py-4 space-y-3">
          <a
            href="/#how"
            className="block text-sm font-medium text-brand-navy/80"
          >
            How it works
          </a>
          <a
            href="/#what"
            className="block text-sm font-medium text-brand-navy/80"
          >
            What it makes
          </a>
          <Link
            href="/pricing"
            className="block text-sm font-medium text-brand-navy/80"
          >
            Pricing
          </Link>
          <a
            href="/#faq"
            className="block text-sm font-medium text-brand-navy/80"
          >
            FAQ
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="btn btn-outline w-full">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-gold w-full">
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
