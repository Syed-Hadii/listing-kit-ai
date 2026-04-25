import { cn } from "@/lib/utils";

const styles = {
  default: "bg-brand-navy/10 text-brand-navy",
  gold: "bg-brand-gold/15 text-brand-goldDark border border-brand-gold/30",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-700",
};

export function Badge({ children, variant = "default", className = "" }) {
  return (
    <span className={cn("badge", styles[variant], className)}>{children}</span>
  );
}
