import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Sparkles,
  Coins,
  FolderOpen,
  TrendingUp,
  Plus,
  ArrowUpRight,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { getPlan } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: recentKits }, { data: paymentReq }] = await Promise.all([
    supabase.from("user_profiles").select("full_name, current_plan, subscription_status, credits_remaining, credits_used, total_kits_generated").eq("id", user.id).single(),
    supabase.from("marketing_kits").select("id, property_type, location, price, target_audience, tone, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("plan_requests").select("status, payoneer_link").eq("user_id", user.id).in("status", ["pending", "payment_link_sent"]).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const plan = getPlan(profile?.current_plan);
  const lowCredits = (profile?.credits_remaining ?? 0) <= 3;
  const noCredits = (profile?.credits_remaining ?? 0) === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Agent"} 👋
          </h1>
          <p className="text-brand-navy/60 mt-1">Here's your Listing Kit AI workspace.</p>
        </div>
        <Link href="/dashboard/new-kit" className="btn btn-gold">
          <Plus size={16} /> Create New Kit
        </Link>
      </div>

      {/* Credit alerts */}
      {noCredits && (
        <div className="card p-5 border-red-200 bg-red-50 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-bold text-red-700">You're out of credits</p>
            <p className="text-sm text-red-600 mt-0.5">Upgrade your plan to continue generating marketing kits.</p>
          </div>
          <Link href="/dashboard/billing" className="btn btn-primary btn-sm">Upgrade</Link>
        </div>
      )}
      {!noCredits && lowCredits && (
        <div className="card p-5 border-amber-200 bg-amber-50 flex items-start gap-3">
          <AlertCircle className="text-amber-600 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-bold text-amber-800">Low credits: only {profile.credits_remaining} left</p>
            <p className="text-sm text-amber-700 mt-0.5">Top up your plan before your next listing.</p>
          </div>
          <Link href="/dashboard/billing" className="btn btn-primary btn-sm">Upgrade</Link>
        </div>
      )}

      {/* Payment notification */}
      {paymentReq && (
        <div className="card p-6 bg-navy-gradient text-white border-brand-gold/30">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Badge variant="gold" className="mb-2">
                {paymentReq.status === "pending" ? "Awaiting payment link" : "Payment link ready"}
              </Badge>
              <h3 className="font-display text-xl font-bold">
                {paymentReq.status === "payment_link_sent" ? "Your Payoneer link is ready" : "Plan request received"}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {paymentReq.status === "payment_link_sent"
                  ? "Click below to complete your payment and activate your plan."
                  : "Saad's Production will send your secure Payoneer link shortly."}
              </p>
            </div>
            {paymentReq.payoneer_link && (
              <a href={paymentReq.payoneer_link} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                Pay Now <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Credits remaining"
          value={profile?.credits_remaining ?? 0}
          sublabel={`of ${plan.credits} /cycle`}
          icon={Coins}
          accent="gold"
        />
        <StatCard
          label="Credits used"
          value={profile?.credits_used ?? 0}
          sublabel="lifetime"
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          label="Kits generated"
          value={profile?.total_kits_generated ?? 0}
          sublabel="all time"
          icon={Sparkles}
          accent="navy"
        />
        <StatCard
          label="Current plan"
          value={plan.name}
          sublabel={profile?.subscription_status?.replace("_", " ")}
          icon={FolderOpen}
          accent="green"
        />
      </div>

      {/* Recent kits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-brand-navy">Recent kits</h2>
          <Link href="/dashboard/kits" className="text-sm font-semibold text-brand-navy hover:text-brand-gold">View all →</Link>
        </div>
        {(!recentKits || recentKits.length === 0) ? (
          <EmptyState
            icon={Sparkles}
            title="No kits yet"
            description="Generate your first property marketing kit in under 30 seconds."
            action={<Link href="/dashboard/new-kit" className="btn btn-gold"><Plus size={16} /> Create Your First Kit</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {recentKits.map((k) => (
              <Link key={k.id} href={`/dashboard/kits/${k.id}`} className="card p-5 hover:border-brand-gold/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="gold">{k.property_type}</Badge>
                  <span className="text-xs text-brand-navy/50">{formatDate(k.created_at)}</span>
                </div>
                <p className="text-brand-navy font-semibold flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-gold" />
                  {k.location}
                </p>
                <p className="text-sm text-brand-navy/60 mt-1">{k.price} · {k.target_audience}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
