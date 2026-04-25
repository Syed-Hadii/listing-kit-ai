"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-brand-navy/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-navy/10">
          <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-navy/5 text-brand-navy/60">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-brand-navy/10 flex justify-end gap-2 bg-brand-cream/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
