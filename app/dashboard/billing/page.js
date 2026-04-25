"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PLANS, getPlan } from "@/lib/plans";
import { formatDateTime } from "@/lib/utils";

export default function BillingPage() {
  const [profile, setProfile] = useState(null);
  const [activeReq, setActiveReq] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(null);

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: p }, { data: req }, { data: hist }] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),
      supabase.from("plan_requests").select("*").eq("user_id", user.id).in("status", ["pending", "payment_link_sent"]).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setProfile(p);
    setActiveReq(req);
    setPaymentHistory(hist || []);
  }

  useEffect(() => { load(); }, []);

  async function choosePlan(id) {
    if (id === "free_trial") return;
    setLoadingPlan(id);
    const tId = toast.loading("Submitting request…");
    try {
      const res = await fetch("/api/plan-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error, { id: tId }); setLoadingPlan(null); return; }
      toast.success("Your plan request has been sent. Saad's Production will send your secure Payoneer payment link shortly.", { id: tId, duration: 6000 });
      await load();
    } catch {
      toast.error("Network error", { id: tId });
    } finally { setLoadingPlan(null); }
  }

  const currentPlan = getPlan(profile?.current_plan);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Billing & Plans</h1>
        <p className="text-brand-navy/60 mt-1">Manage your plan and payments.</p>
      </div>

      {/* Current plan status */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-navy/60 font-semibold">Current plan</p>
            <p className="font-display text-2xl font-bold text-brand-navy mt-1">{currentPlan.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-navy/60 font-semibold">Status</p>
            <div className="mt-2">
              <Badge variant={profile?.subscription_status === "active" ? "green" : "gray"}>
                {profile?.subscription_status?.replace("_", " ") || "—"}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-navy/60 font-semibold">Credits remaining</p>
            <p className="font-display text-2xl font-bold text-brand-gold mt-1">{profile?.credits_remaining ?? 0}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-navy/60 font-semibold">Credits used</p>
            <p className="font-display text-2xl font-bold text-brand-navy mt-1">{profile?.credits_used ?? 0}</p>
          </div>
        </div>
      </Card>

      {/* Active request */}
      {activeReq && (
        <Card className={activeReq.status === "payment_link_sent" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}>
          <div className="flex items-start gap-3">
            {activeReq.status === "payment_link_sent"
              ? <Check className="text-emerald-600 mt-0.5" size={20} />
              : <Clock className="text-amber-600 mt-0.5" size={20} />}
            <div className="flex-1">
              <p className={`font-bold ${activeReq.status === "payment_link_sent" ? "text-emerald-800" : "text-amber-800"}`}>
                {activeReq.status === "payment_link_sent" ? "Your Payoneer link is ready" : "Plan request pending"}
              </p>
              <p className={`text-sm mt-0.5 ${activeReq.status === "payment_link_sent" ? "text-emerald-700" : "text-amber-700"}`}>
                Plan: <strong className="capitalize">{activeReq.selected_plan}</strong> — ${activeReq.plan_price}
              </p>
              {activeReq.status === "pending" && (
                <p className="text-xs text-amber-700 mt-2">
                  Saad's Production will send your secure Payoneer link shortly. You'll be notified here.
                </p>
              )}
              {activeReq.status === "payment_link_sent" && (
                <p className="text-xs text-emerald-700 mt-2">
                  After payment, your plan will be activated once confirmed by Saad's Production.
                </p>
              )}
            </div>
            {activeReq.payoneer_link && (
              <a href={activeReq.payoneer_link} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                Pay Now <ExternalLink size={14} />
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Plans grid */}
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-navy mb-4">Choose a plan</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p) => {
            const isCurrent = profile?.current_plan === p.id;
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-6 relative flex flex-col ${
                  p.popular ? "bg-brand-navy text-white border-2 border-brand-gold shadow-luxury"
                            : "bg-white border border-brand-navy/10"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-brand-navy text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                )}
                <h3 className={`text-lg font-bold ${p.popular ? "text-white" : "text-brand-navy"}`}>{p.name}</h3>
                <p className={`text-xs mt-1 ${p.popular ? "text-white/60" : "text-brand-navy/60"}`}>{p.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold font-display ${p.popular ? "text-white" : "text-brand-navy"}`}>${p.price}</span>
                  <span className={`text-sm ${p.popular ? "text-white/60" : "text-brand-navy/60"}`}>{p.price > 0 ? "/mo" : ""}</span>
                </div>
                <p className={`mt-1 text-sm font-semibold ${p.popular ? "text-brand-gold" : "text-brand-goldDark"}`}>
                  {p.credits} credits
                </p>
                <ul className="mt-4 space-y-2 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={14} className={`mt-0.5 ${p.popular ? "text-brand-gold" : "text-brand-goldDark"}`} />
                      <span className={p.popular ? "text-white/85" : "text-brand-navy/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className={`mt-5 text-center py-2.5 rounded-xl text-sm font-bold ${p.popular ? "bg-white/10 text-white" : "bg-brand-navy/5 text-brand-navy"}`}>
                    Current Plan
                  </div>
                ) : (
                  <Button
                    onClick={() => choosePlan(p.id)}
                    disabled={loadingPlan === p.id || !!activeReq || p.id === "free_trial"}
                    variant={p.popular ? "gold" : "primary"}
                    className="mt-5 w-full"
                  >
                    {p.id === "free_trial" ? "Default" : (loadingPlan === p.id ? "Submitting…" : p.cta)}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        {activeReq && (
          <div className="mt-4 text-xs text-brand-navy/60 flex items-center gap-2">
            <AlertCircle size={14} /> You can only have one active plan request at a time.
          </div>
        )}
      </div>

      {/* Payment history */}
      {paymentHistory.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-navy mb-4">Payment history</h2>
          <Card className="!p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-cream/50 text-brand-navy/70 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Plan</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-left px-4 py-3">Paid</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="border-t border-brand-navy/5">
                    <td className="px-4 py-3 font-medium text-brand-navy">{p.plan_name}</td>
                    <td className="px-4 py-3">${p.amount}</td>
                    <td className="px-4 py-3"><Badge variant={p.status === "paid" ? "green" : p.status === "cancelled" ? "red" : "yellow"}>{p.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-brand-navy/60">{formatDateTime(p.created_at)}</td>
                    <td className="px-4 py-3 text-brand-navy/60">{p.marked_paid_at ? formatDateTime(p.marked_paid_at) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
