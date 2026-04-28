import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="border-t border-brand-navy/10 bg-white/70">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 text-xs text-brand-navy/60 text-center">
        <span>
          Copyright © {new Date().getFullYear()} Listing Kit AI. All rights
          reserved | Design & Develop by
        </span>
        <Link
          href="https://www.saadsproduction.com"
          className="text-brand-navy font-semibold hover:text-brand-gold ml-1.5"
          target="_blank"
          rel="noreferrer"
        >
          Saad&apos;s Production
        </Link>
      </div>
    </footer>
  );
}
