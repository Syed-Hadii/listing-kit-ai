import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureAdmin() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", status: 401 };
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") return { error: "Forbidden", status: 403 };
  return { user };
}

export async function POST(request) {
  const gate = await ensureAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const admin = createSupabaseAdminClient();
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      // --- CREDITS ---
      case "add_credits": {
        const { user_id, amount, reason } = body;
        const { data: p } = await admin
          .from("user_profiles")
          .select("credits_remaining")
          .eq("id", user_id)
          .single();
        const next = (p?.credits_remaining ?? 0) + Number(amount);
        await admin.from("user_profiles").update({ credits_remaining: next }).eq("id", user_id);
        await admin.from("credit_logs").insert({
          user_id, action: "admin_add", credits_change: Number(amount), reason: reason || "Admin added credits",
        });
        await admin.from("notifications").insert({
          user_id,
          title: "Credits added",
          message: `${amount} credits were added to your account.`,
          type: "credits_added",
        });
        return NextResponse.json({ ok: true });
      }
      case "remove_credits": {
        const { user_id, amount, reason } = body;
        const { data: p } = await admin
          .from("user_profiles")
          .select("credits_remaining")
          .eq("id", user_id)
          .single();
        const next = Math.max(0, (p?.credits_remaining ?? 0) - Number(amount));
        await admin.from("user_profiles").update({ credits_remaining: next }).eq("id", user_id);
        await admin.from("credit_logs").insert({
          user_id, action: "admin_remove", credits_change: -Number(amount), reason: reason || "Admin removed credits",
        });
        return NextResponse.json({ ok: true });
      }
      case "reset_credits": {
        const { user_id, amount = 0 } = body;
        await admin.from("user_profiles").update({ credits_remaining: Number(amount) }).eq("id", user_id);
        await admin.from("credit_logs").insert({
          user_id, action: "admin_reset", credits_change: 0, reason: `Admin reset credits to ${amount}`,
        });
        return NextResponse.json({ ok: true });
      }

      // --- USER STATUS ---
      case "toggle_disabled": {
        const { user_id, is_disabled } = body;
        await admin.from("user_profiles").update({ is_disabled: !!is_disabled }).eq("id", user_id);
        return NextResponse.json({ ok: true });
      }
      case "change_plan": {
        const { user_id, plan_id } = body;
        const plan = getPlan(plan_id);
        await admin.from("user_profiles").update({
          current_plan: plan.id,
          subscription_status: plan.id === "free_trial" ? "free_trial" : "active",
          credits_remaining: plan.credits,
        }).eq("id", user_id);
        return NextResponse.json({ ok: true });
      }
      case "change_subscription_status": {
        const { user_id, status } = body;
        await admin.from("user_profiles").update({ subscription_status: status }).eq("id", user_id);
        return NextResponse.json({ ok: true });
      }

      // --- NOTIFICATIONS ---
      case "send_notification": {
        const { user_id, title, message } = body;
        await admin.from("notifications").insert({
          user_id, title, message, type: "admin_message",
        });
        return NextResponse.json({ ok: true });
      }

      // --- PLAN REQUESTS / PAYMENTS ---
      case "send_payment_link": {
        const { plan_request_id, payoneer_link } = body;
        const { data: pr } = await admin
          .from("plan_requests").select("*").eq("id", plan_request_id).single();
        if (!pr) return NextResponse.json({ error: "Plan request not found" }, { status: 404 });

        await admin.from("plan_requests").update({
          payoneer_link, status: "payment_link_sent",
        }).eq("id", plan_request_id);

        await admin.from("payments").update({
          payoneer_link, status: "payment_link_sent",
        }).eq("plan_request_id", plan_request_id);

        await admin.from("notifications").insert({
          user_id: pr.user_id,
          title: "Payment link ready",
          message: "Your secure Payoneer payment link is now available inside your Billing page.",
          type: "payment_link_sent",
        });
        return NextResponse.json({ ok: true });
      }

      case "mark_paid_and_activate": {
        const { plan_request_id } = body;
        const { data: pr } = await admin
          .from("plan_requests").select("*").eq("id", plan_request_id).single();
        if (!pr) return NextResponse.json({ error: "Plan request not found" }, { status: 404 });

        const now = new Date().toISOString();
        await admin.from("plan_requests").update({ status: "activated" }).eq("id", plan_request_id);
        await admin.from("payments").update({
          status: "paid", marked_paid_at: now,
        }).eq("plan_request_id", plan_request_id);

        await admin.from("user_profiles").update({
          current_plan: pr.selected_plan,
          subscription_status: "active",
          credits_remaining: pr.plan_credits,
        }).eq("id", pr.user_id);

        await admin.from("notifications").insert({
          user_id: pr.user_id,
          title: "Payment confirmed 🎉",
          message: `Your ${pr.selected_plan} plan is now active with ${pr.plan_credits} credits.`,
          type: "payment_confirmed",
        });
        await admin.from("credit_logs").insert({
          user_id: pr.user_id,
          action: "plan_activation",
          credits_change: pr.plan_credits,
          reason: `Activated ${pr.selected_plan} plan`,
        });
        return NextResponse.json({ ok: true });
      }

      case "cancel_plan_request": {
        const { plan_request_id } = body;
        const { data: pr } = await admin
          .from("plan_requests").select("*").eq("id", plan_request_id).single();
        if (!pr) return NextResponse.json({ error: "Plan request not found" }, { status: 404 });
        await admin.from("plan_requests").update({ status: "cancelled" }).eq("id", plan_request_id);
        await admin.from("payments").update({ status: "cancelled" }).eq("plan_request_id", plan_request_id);
        await admin.from("notifications").insert({
          user_id: pr.user_id,
          title: "Plan request cancelled",
          message: "Your plan request was cancelled by support. Contact us if you have questions.",
          type: "admin_message",
        });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Admin API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
