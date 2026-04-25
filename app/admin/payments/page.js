"use client";
import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card, Select } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("payments")
        .select("*, user_profiles!inner(email, full_name)")
        .order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;
  }, [rows, statusFilter]);

  const totalPaid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Payments</h1>
          <p className="text-brand-navy/60 mt-1">{rows.length} total · Total collected: <strong className="text-brand-gold">${totalPaid}</strong></p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="payment_link_sent">payment_link_sent</option>
          <option value="paid">paid</option>
          <option value="cancelled">cancelled</option>
        </Select>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-brand-cream/50 text-brand-navy/70 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Credits</th>
                <th className="text-left px-4 py-3">Payoneer link</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Marked paid</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-navy/50">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-navy/50">No payments.</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-brand-navy/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.user_profiles?.full_name || "—"}</p>
                    <p className="text-xs text-brand-navy/60">{r.user_profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{r.plan_name}</td>
                  <td className="px-4 py-3">${r.amount}</td>
                  <td className="px-4 py-3">{r.credits}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate text-xs">
                    {r.payoneer_link ? <a href={r.payoneer_link} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Open</a> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "paid" ? "green" : r.status === "cancelled" ? "red" : r.status === "payment_link_sent" ? "blue" : "yellow"}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/60">{formatDateTime(r.created_at)}</td>
                  <td className="px-4 py-3 text-brand-navy/60">{r.marked_paid_at ? formatDateTime(r.marked_paid_at) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
