import { cn } from "@/lib/utils";

const styles = {
  default: "bg-brand-navy/10 text-brand-navy border border-brand-navy/10",
  gold: "bg-brand-gold/12 text-brand-goldDark border border-brand-gold/30",
  green: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  red: "bg-red-50 text-red-700 border border-red-200",
  yellow: "bg-amber-50 text-amber-800 border border-amber-200",
  blue: "bg-blue-50 text-blue-800 border border-blue-200",
  gray: "bg-gray-50 text-gray-700 border border-gray-200",
};

export function Badge({ children, variant = "default", className = "" }) {
  return (
    <span className={cn("badge", styles[variant], className)}>{children}</span>
  );
}
