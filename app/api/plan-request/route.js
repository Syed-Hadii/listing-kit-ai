import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { plan_id } = await request.json();
    const plan = getPlan(plan_id);
    if (!plan || plan.id === "free_trial") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Check existing pending request
    const { data: existing } = await admin
      .from("plan_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "payment_link_sent"])
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending plan request. Please wait for it to be processed." },
        { status: 409 }
      );
    }

    const { data: planReq, error } = await admin
      .from("plan_requests")
      .insert({
        user_id: user.id,
        selected_plan: plan.id,
        plan_price: plan.price,
        plan_credits: plan.credits,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }

    await admin.from("payments").insert({
      user_id: user.id,
      plan_request_id: planReq.id,
      plan_name: plan.name,
      amount: plan.price,
      credits: plan.credits,
      status: "pending",
    });

    await admin.from("notifications").insert({
      user_id: user.id,
      title: "Plan request received",
      message: `Your ${plan.name} plan request has been sent. Saad's Production will send your secure Payoneer payment link inside your dashboard shortly.`,
      type: "plan_request_received",
    });

    return NextResponse.json({ ok: true, request: planReq });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
