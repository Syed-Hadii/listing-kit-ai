"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link2, Check, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card, Input } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export default function AdminPlanRequests() {
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("plan_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data && data.length > 0) {
      // Fetch user profiles separately
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      
      const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);
      const enrichedData = data.map(r => ({
        ...r,
        user_profiles: profileMap[r.user_id],
      }));
      setReqs(enrichedData);
    } else {
      setReqs(data || []);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function action(payload) {
    setBusy(true);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { toast.error(data.error || "Failed"); return false; }
    toast.success("Done");
    await load();
    return true;
  }

  async function sendLink() {
    if (!link.trim()) return;
    const ok = await action({ action: "send_payment_link", plan_request_id: selected.id, payoneer_link: link.trim() });
    if (ok) { setSelected(null); setLink(""); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Plan Requests</h1>
        <p className="text-brand-navy/60 mt-1">{reqs.length} total</p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-brand-cream/50 text-brand-navy/70 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Credits</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Payoneer link</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-navy/50">Loading…</td></tr>}
              {!loading && reqs.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-navy/50">No requests yet.</td></tr>}
              {reqs.map((r) => (
                <tr key={r.id} className="border-t border-brand-navy/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.user_profiles?.full_name || "—"}</p>
                    <p className="text-xs text-brand-navy/60">{r.user_profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize font-semibold">{r.selected_plan}</td>
                  <td className="px-4 py-3">${r.plan_price}</td>
                  <td className="px-4 py-3">{r.plan_credits}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "activated" ? "green" : r.status === "cancelled" ? "red" : r.status === "payment_link_sent" ? "blue" : "yellow"}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 max-w-[180px] truncate text-xs text-brand-navy/60">
                    {r.payoneer_link ? <a href={r.payoneer_link} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Open link</a> : "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-navy/60">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end flex-wrap">
                      {(r.status === "pending" || r.status === "payment_link_sent") && (
                        <Button size="sm" variant="outline" onClick={() => { setSelected(r); setLink(r.payoneer_link || ""); }}>
                          <Link2 size={12} /> Link
                        </Button>
                      )}
                      {r.status !== "activated" && r.status !== "cancelled" && (
                        <Button size="sm" variant="gold" onClick={() => { if (confirm("Mark paid and activate plan?")) action({ action: "mark_paid_and_activate", plan_request_id: r.id }); }} disabled={busy}>
                          <Check size={12} /> Activate
                        </Button>
                      )}
                      {r.status !== "activated" && r.status !== "cancelled" && (
                        <Button size="sm" variant="danger" onClick={() => { if (confirm("Cancel this request?")) action({ action: "cancel_plan_request", plan_request_id: r.id }); }} disabled={busy}>
                          <X size={12} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Send Payoneer payment link"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button variant="gold" onClick={sendLink} disabled={busy || !link.trim()}>{busy ? "Saving…" : "Send link"}</Button>
          </>
        }
      >
        {selected && (
          <p className="text-sm text-brand-navy/60 mb-3">
            User: <strong>{selected.user_profiles?.email}</strong> · Plan: <strong className="capitalize">{selected.selected_plan}</strong> (${selected.plan_price})
          </p>
        )}
        <Input label="Payoneer payment link" placeholder="https://payoneer.com/..." value={link} onChange={(e) => setLink(e.target.value)} />
        <p className="text-xs text-brand-navy/60 mt-2">
          The user will be notified and see the link on their Billing page immediately.
        </p>
      </Modal>
    </div>
  );
}
