import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Users, ClipboardList, Sparkles, TrendingUp, Coins, DollarSign, Activity } from "lucide-react";
import { getPlan } from "@/lib/plans";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = createSupabaseServerClient();

  const [
    { data: allProfiles },
    { data: pendingReqs },
    { data: recentReqs },
    { count: totalKitsCount },
    { data: recentSignups },
  ] = await Promise.all([
    supabase.from("user_profiles").select("id, current_plan, subscription_status, credits_used, last_active_at, created_at"),
    supabase.from("plan_requests").select("id, user_id, selected_plan, plan_price, status, created_at").in("status", ["pending", "payment_link_sent"]).order("created_at", { ascending: false }),
    supabase.from("plan_requests").select("id, user_id, selected_plan, plan_price, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("marketing_kits").select("*", { count: "exact", head: true }),
    supabase.from("user_profiles").select("id, email, full_name, current_plan, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalUsers = allProfiles?.length || 0;
  const freeTrialUsers = allProfiles?.filter((p) => p.current_plan === "free_trial").length || 0;
  const activeSubs = allProfiles?.filter((p) => p.subscription_status === "active").length || 0;
  const activeUsers = allProfiles?.filter((p) => {
    if (!p.last_active_at) return false;
    const daysAgo = (Date.now() - new Date(p.last_active_at)) / 86400000;
    return daysAgo <= 30;
  }).length || 0;
  const totalCreditsUsed = allProfiles?.reduce((sum, p) => sum + (p.credits_used || 0), 0) || 0;

  const mrr = allProfiles?.reduce((sum, p) => {
    if (p.subscription_status !== "active") return sum;
    return sum + (getPlan(p.current_plan).price || 0);
  }, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Admin Overview</h1>
        <p className="text-brand-navy/60 mt-1">Listing Kit AI — real-time metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={totalUsers} icon={Users} accent="navy" />
        <StatCard label="Active users (30d)" value={activeUsers} icon={Activity} accent="green" />
        <StatCard label="Free trial users" value={freeTrialUsers} icon={Sparkles} accent="blue" />
        <StatCard label="Active subscriptions" value={activeSubs} icon={TrendingUp} accent="green" />
        <StatCard label="Pending requests" value={pendingReqs?.length || 0} icon={ClipboardList} accent="gold" />
        <StatCard label="Total kits generated" value={totalKitsCount ?? 0} icon={Sparkles} accent="navy" />
        <StatCard label="Total credits used" value={totalCreditsUsed} icon={Coins} accent="gold" />
        <StatCard label="Estimated MRR" value={`$${mrr}`} icon={DollarSign} accent="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-brand-navy">Recent signups</h3>
            <Link href="/admin/users" className="text-xs text-brand-gold font-semibold">View all →</Link>
          </div>
          {(!recentSignups || recentSignups.length === 0) ? (
            <p className="text-sm text-brand-navy/50 py-4">No signups yet.</p>
          ) : (
            <ul className="divide-y divide-brand-navy/5">
              {recentSignups.map((u) => (
                <li key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-brand-navy text-sm">{u.full_name || u.email}</p>
                    <p className="text-xs text-brand-navy/60">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">{u.current_plan?.replace("_", " ")}</Badge>
                    <p className="text-xs text-brand-navy/50 mt-1">{timeAgo(u.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-brand-navy">Recent plan requests</h3>
            <Link href="/admin/plan-requests" className="text-xs text-brand-gold font-semibold">View all →</Link>
          </div>
          {(!recentReqs || recentReqs.length === 0) ? (
            <p className="text-sm text-brand-navy/50 py-4">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-brand-navy/5">
              {recentReqs.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-brand-navy text-sm capitalize">{r.selected_plan} · ${r.plan_price}</p>
                    <p className="text-xs text-brand-navy/50">{formatDate(r.created_at)}</p>
                  </div>
                  <Badge variant={r.status === "activated" ? "green" : r.status === "cancelled" ? "red" : "yellow"}>
                    {r.status.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
