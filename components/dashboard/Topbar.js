"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Bell, Plus, CreditCard } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";

export function Topbar({ profile }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const supabaseRef = useRef(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabaseRef.current = supabase;
    if (!profile?.id) return;

    let interval;
    const load = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        const { data } = await supabase
          .from("notifications")
          .select("id, title, message, is_read, created_at")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(8);
        setItems(data || []);
        setUnread((data || []).filter((n) => !n.is_read).length);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    load();
    interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  }

  const lowCredits = (profile?.credits_remaining ?? 0) <= 3;
  const noCredits = (profile?.credits_remaining ?? 0) === 0;

  return (
    <div className="h-16 bg-white border-b border-brand-navy/10 flex items-center justify-between px-4 lg:px-8 sticky top-20 z-10 lg:top-0 mt-20 lg:mt-0">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-brand-navy/60">Credits:</span>
          <Badge variant={noCredits ? "red" : lowCredits ? "yellow" : "gold"}>
            {profile?.credits_remaining ?? 0}
          </Badge>
        </div>
        <Badge
          variant={profile?.subscription_status === "active" ? "green" : "gray"}
        >
          {profile?.current_plan?.replace("_", " ") || "free trial"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/billing"
          className="btn btn-outline btn-sm hidden sm:inline-flex"
        >
          <CreditCard size={14} /> Upgrade
        </Link>
        <Link href="/dashboard/new-kit" className="btn btn-gold btn-sm">
          <Plus size={14} /> New Kit
        </Link>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="relative w-10 h-10 rounded-xl hover:bg-brand-navy/5 flex items-center justify-center text-brand-navy"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-brand-gold text-brand-navy text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-luxury border border-brand-navy/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-brand-navy/10 flex items-center justify-between">
                <span className="font-bold text-brand-navy text-sm">
                  Notifications
                </span>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-gold font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {items.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-brand-navy/50">
                    No notifications yet
                  </p>
                )}
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-brand-navy/5 last:border-0 ${!n.is_read ? "bg-brand-gold/5" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-gold flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-brand-navy">
                          {n.title}
                        </p>
                        <p className="text-xs text-brand-navy/60 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-brand-navy/40 mt-1">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-center text-xs font-semibold text-brand-navy hover:bg-brand-cream/50"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
