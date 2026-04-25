import Link from "next/link";

export function Logo({ href = "/", className = "", light = false }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-luxury">
        <span className="font-display font-bold text-brand-navy text-lg leading-none">L</span>
        <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-brand-navy border-2 border-white" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`font-display font-bold text-base ${light ? "text-white" : "text-brand-navy"}`}>
          Listing Kit <span className="text-brand-gold">AI</span>
        </span>
        <span className={`text-[10px] uppercase tracking-wider ${light ? "text-white/60" : "text-brand-navy/50"}`}>
          by Saad's Production
        </span>
      </span>
    </Link>
  );
}
