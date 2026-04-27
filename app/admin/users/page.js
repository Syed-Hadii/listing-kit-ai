"use client";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Minus, RotateCcw, Ban, Check, Send, MessageCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card, Input, Select } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PLANS } from "@/lib/plans";
import { formatDate, timeAgo } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // 'credits' | 'plan' | 'notify' | 'status'
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Kits per user map
  const [kitsCount, setKitsCount] = useState({});

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const [{ data }, { data: kits }] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("id, full_name, email, role, is_disabled, current_plan, subscription_status, credits_remaining, credits_used, created_at, last_active_at")
        .order("created_at", { ascending: false }),
      supabase.from("marketing_kits").select("user_id"),
    ]);
    setUsers(data || []);
    // Aggregate kit counts
    const counts = {};
    (kits || []).forEach((k) => { counts[k.user_id] = (counts[k.user_id] || 0) + 1; });
    setKitsCount(counts);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (planFilter && u.current_plan !== planFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (u.email || "").toLowerCase().includes(s) || (u.full_name || "").toLowerCase().includes(s);
      }
      return true;
    });
  }, [users, search, planFilter]);

  async function callAdmin(payload) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return false; }
      toast.success("Done");
      await load();
      return true;
    } catch { toast.error("Network error"); return false; }
    finally { setBusy(false); }
  }

  function openAction(user, which) {
    setSelected(user); setAction(which);
    setAmount(""); setReason(""); setNotifTitle(""); setNotifMsg("");
    setNewPlan(user.current_plan);
    setSubStatus(user.subscription_status);
  }
  function close() { setSelected(null); setAction(null); }

  async function submitAction() {
    if (!selected) return;
    let ok = false;
    if (action === "add_credits") ok = await callAdmin({ action: "add_credits", user_id: selected.id, amount: Number(amount), reason });
    else if (action === "remove_credits") ok = await callAdmin({ action: "remove_credits", user_id: selected.id, amount: Number(amount), reason });
    else if (action === "reset_credits") ok = await callAdmin({ action: "reset_credits", user_id: selected.id, amount: Number(amount) });
    else if (action === "plan") ok = await callAdmin({ action: "change_plan", user_id: selected.id, plan_id: newPlan });
    else if (action === "status") ok = await callAdmin({ action: "change_subscription_status", user_id: selected.id, status: subStatus });
    else if (action === "notify") ok = await callAdmin({ action: "send_notification", user_id: selected.id, title: notifTitle, message: notifMsg });
    else if (action === "toggle_disabled") ok = await callAdmin({ action: "toggle_disabled", user_id: selected.id, is_disabled: !selected.is_disabled });
    if (ok) close();
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Users</h1>
        <p className="text-brand-navy/60 mt-1">{users.length} total · {filtered.length} shown</p>
      </div>

      <Card className="!p-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy/40" size={16} />
            <input className="input pl-10" placeholder="Search by email or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option value="">All plans</option>
            {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-brand-cream/50 text-brand-navy/70 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Credits</th>
                <th className="text-left px-4 py-3">Used</th>
                <th className="text-left px-4 py-3">Kits</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Last active</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="px-4 py-8 text-center text-brand-navy/50">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-brand-navy/50">No users match.</td></tr>}
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-brand-navy/5 hover:bg-brand-cream/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-navy">{u.full_name || "—"}</p>
                    <p className="text-xs text-brand-navy/60">{u.email}</p>
                    {u.role === "admin" && <Badge variant="gold" className="mt-1">Admin</Badge>}
                    {u.is_disabled && <Badge variant="red" className="mt-1">Disabled</Badge>}
                  </td>
                  <td className="px-4 py-3 capitalize">{u.current_plan?.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.subscription_status === "active" ? "green" : "gray"}>{u.subscription_status?.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gold">{u.credits_remaining}</td>
                  <td className="px-4 py-3">{u.credits_used}</td>
                  <td className="px-4 py-3">{kitsCount[u.id] || 0}</td>
                  <td className="px-4 py-3 text-brand-navy/60">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-brand-navy/60">{u.last_active_at ? timeAgo(u.last_active_at) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => openAction(u, "add_credits")} title="Add credits"><Plus size={12} /></Button>
                      <Button size="sm" variant="outline" onClick={() => openAction(u, "remove_credits")} title="Remove credits"><Minus size={12} /></Button>
                      <Button size="sm" variant="outline" onClick={() => openAction(u, "reset_credits")} title="Reset credits"><RotateCcw size={12} /></Button>
                      <Button size="sm" variant="outline" onClick={() => openAction(u, "plan")} title="Change plan">Plan</Button>
                      <Button size="sm" variant="outline" onClick={() => openAction(u, "status")} title="Change status">Status</Button>
                      <Button size="sm" variant="outline" onClick={() => openAction(u, "notify")} title="Send notification"><MessageCircle size={12} /></Button>
                      <Button size="sm" variant={u.is_disabled ? "primary" : "danger"} onClick={() => { if (confirm(u.is_disabled ? "Enable this user?" : "Disable this user?")) { setSelected(u); setAction("toggle_disabled"); setTimeout(submitAction, 0); } }}>
                        {u.is_disabled ? <Check size={12} /> : <Ban size={12} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!selected && !!action && action !== "toggle_disabled"}
        onClose={close}
        title={action === "add_credits" ? "Add credits" :
               action === "remove_credits" ? "Remove credits" :
               action === "reset_credits" ? "Reset credits" :
               action === "plan" ? "Change plan" :
               action === "status" ? "Change subscription status" :
               action === "notify" ? "Send notification" : ""}
        footer={
          <>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button variant="gold" onClick={submitAction} disabled={busy}>{busy ? "Saving…" : "Confirm"}</Button>
          </>
        }
      >
        {selected && (
          <p className="text-sm text-brand-navy/60 mb-3">User: <strong>{selected.email}</strong></p>
        )}
        {(action === "add_credits" || action === "remove_credits" || action === "reset_credits") && (
          <>
            <Input label={action === "reset_credits" ? "Reset to (amount)" : "Amount"} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            {action !== "reset_credits" && <Input label="Reason (optional)" className="mt-3" value={reason} onChange={(e) => setReason(e.target.value)} />}
          </>
        )}
        {action === "plan" && (
          <Select label="Plan" value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
            {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.credits} credits</option>)}
          </Select>
        )}
        {action === "status" && (
          <Select label="Subscription status" value={subStatus} onChange={(e) => setSubStatus(e.target.value)}>
            <option value="free_trial">free_trial</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="cancelled">cancelled</option>
          </Select>
        )}
        {action === "notify" && (
          <div className="space-y-3">
            <Input label="Title" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
            <Input label="Message" value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} />
          </div>
        )}
      </Modal>
    </div>
  );
}
