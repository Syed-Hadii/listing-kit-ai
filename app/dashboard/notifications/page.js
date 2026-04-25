"use client";
import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/utils";

const TYPE_VARIANT = {
  plan_request_received: "yellow",
  payment_link_sent: "blue",
  payment_confirmed: "green",
  credits_added: "green",
  credits_low: "yellow",
  credits_empty: "red",
  admin_message: "default",
};

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((p) => p.map((n) => ({ ...n, is_read: true })));
  }

  async function markOne(id) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Notifications</h1>
          <p className="text-brand-navy/60 mt-1">{unread} unread · {items.length} total</p>
        </div>
        {unread > 0 && <Button variant="outline" onClick={markAllRead}><Check size={14} /> Mark all read</Button>}
      </div>
      {loading ? (
        <Card><p className="text-brand-navy/60 text-center py-8">Loading…</p></Card>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You'll see plan updates, payment confirmations, and admin messages here." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card
              key={n.id}
              className={`!p-5 cursor-pointer transition ${!n.is_read ? "border-brand-gold/40 bg-brand-gold/5" : ""}`}
              onClick={() => !n.is_read && markOne(n.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={TYPE_VARIANT[n.type] || "default"}>{(n.type || "info").replace(/_/g, " ")}</Badge>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-gold" />}
                    <span className="text-xs text-brand-navy/50">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="mt-2 font-bold text-brand-navy">{n.title}</p>
                  <p className="text-sm text-brand-navy/70 mt-0.5">{n.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
