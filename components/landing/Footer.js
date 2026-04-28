import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white/80 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="inline-block">
            <img
              src="/images/logo.png"
              alt="Listing Kit AI"
              className="h-16 w-auto"
            />
          </Link>
          <p className="mt-4 text-sm text-white/60 max-w-sm">
            AI-powered marketing kits for real estate agents. Generate captions,
            reels, emails, ads, and listing copy in seconds — all from one
            property form.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/pricing" className="hover:text-brand-gold">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-brand-gold">
                Start Free
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-brand-gold">
                Log in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacy" className="hover:text-brand-gold">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-brand-gold">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-gold">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} Listing Kit AI. All rights reserved.
          </p>
          <p>
            Powered by{" "}
            <a
              href="https://www.saadsproduction.com"
              className="text-brand-gold font-semibold hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              Saad&apos;s Production
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
