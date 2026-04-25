"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardList,
  DollarSign,
  FileText,
  Send,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const USER_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/new-kit", label: "New Kit", icon: Sparkles },
  { href: "/dashboard/kits", label: "Saved Kits", icon: FolderOpen },
  { href: "/dashboard/billing", label: "Billing / Plans", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/plan-requests", label: "Plan Requests", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/kits", label: "Generated Kits", icon: FileText },
  { href: "/admin/notifications", label: "Notifications", icon: Send },
];

export function Sidebar({ variant = "user", userRole = "user" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = variant === "admin" ? ADMIN_LINKS : USER_LINKS;

  async function onLogout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <Logo light />
      </div>

      {variant === "admin" && (
        <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold flex items-center gap-2">
          <Shield size={14} /> Admin Mode
        </div>
      )}

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== "/dashboard" && link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-gold-gradient text-brand-navy font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} /> {link.label}
            </Link>
          );
        })}

        {userRole === "admin" && variant !== "admin" && (
          <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-gold hover:bg-white/5 mt-4">
            <Shield size={18} /> Admin Panel
          </Link>
        )}
        {userRole === "admin" && variant === "admin" && (
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-gold hover:bg-white/5 mt-4">
            <LayoutDashboard size={18} /> Back to User Dashboard
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-brand-navy h-14 flex items-center justify-between px-4 border-b border-white/10">
        <Logo light />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="w-72 bg-brand-navy text-white">{content}</aside>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex w-72 bg-brand-navy text-white flex-col fixed inset-y-0 left-0 z-20">
        {content}
      </aside>
    </>
  );
}
