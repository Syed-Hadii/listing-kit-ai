import { cn } from "@/lib/utils";

export function Card({ className = "", children, ...props }) {
  return (
    <div className={cn("card p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function Input({ className = "", label, error, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input className={cn("input", error && "border-red-400", className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ className = "", label, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea className={cn("textarea", className)} {...props} />
    </div>
  );
}

export function Select({ className = "", label, children, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select className={cn("select", className)} {...props}>
        {children}
      </select>
    </div>
  );
}

export function StatCard({ label, value, sublabel, icon: Icon, accent = "navy" }) {
  const accents = {
    navy: "text-brand-navy bg-brand-navy/10",
    gold: "text-brand-goldDark bg-brand-gold/15",
    green: "text-emerald-700 bg-emerald-100",
    blue: "text-blue-700 bg-blue-100",
    red: "text-red-700 bg-red-100",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-brand-navy/60 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-bold text-brand-navy font-display">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-brand-navy/60">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accents[accent])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
