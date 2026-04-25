import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { generateMarketingKit, safeParseJSON } from "@/lib/aiProvider";
import { buildMarketingKitPrompt } from "@/lib/prompts";
import { validateGenerateRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, credits_remaining, credits_used, total_kits_generated, is_disabled")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.is_disabled) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }
    if ((profile.credits_remaining ?? 0) <= 0) {
      return NextResponse.json(
        { error: "No credits remaining. Please upgrade your plan." },
        { status: 402 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateGenerateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.errors },
        { status: 400 }
      );
    }

    // Build prompt
    const prompt = buildMarketingKitPrompt(body);

    // Call AI provider
    let rawText;
    try {
      rawText = await generateMarketingKit(prompt);
    } catch (err) {
      console.error("AI generation failed:", err);
      return NextResponse.json(
        { error: "AI generation failed. Please try again. No credit was charged." },
        { status: 502 }
      );
    }

    const parsed = safeParseJSON(rawText);
    if (!parsed) {
      console.error("AI returned invalid JSON:", rawText?.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again. No credit was charged." },
        { status: 502 }
      );
    }

    // Validate required keys
    const needed = [
      "instagram_caption",
      "reel_script",
      "email_blast",
      "ad_copy",
      "linkedin_post",
      "property_description_output",
    ];
    for (const k of needed) {
      if (!parsed[k] || typeof parsed[k] !== "string") {
        console.error("Missing key in AI response:", k);
        return NextResponse.json(
          { error: "Incomplete AI response. Please try again. No credit was charged." },
          { status: 502 }
        );
      }
    }

    // Persist kit + deduct credit atomically-ish via admin client
    const admin = createSupabaseAdminClient();
    const kitRow = {
      user_id: user.id,
      property_type: body.property_type,
      location: body.location,
      price: body.price,
      bedrooms: body.bedrooms || null,
      bathrooms: body.bathrooms || null,
      square_footage: body.square_footage || null,
      key_features: body.key_features || null,
      property_description: body.property_description || null,
      target_audience: body.target_audience || null,
      tone: body.tone || null,
      platform_focus: body.platform_focus || null,
      language: body.language || null,
      instagram_caption: parsed.instagram_caption,
      reel_script: parsed.reel_script,
      email_blast: parsed.email_blast,
      ad_copy: parsed.ad_copy,
      linkedin_post: parsed.linkedin_post,
      property_description_output: parsed.property_description_output,
    };

    const { data: kit, error: kitError } = await admin
      .from("marketing_kits")
      .insert(kitRow)
      .select("*")
      .single();

    if (kitError) {
      console.error("Kit save failed:", kitError);
      return NextResponse.json(
        { error: "Failed to save kit. No credit was charged." },
        { status: 500 }
      );
    }

    // Deduct 1 credit
    const newRemaining = Math.max(0, (profile.credits_remaining ?? 0) - 1);
    const newUsed = (profile.credits_used ?? 0) + 1;
    const newTotal = (profile.total_kits_generated ?? 0) + 1;

    await admin
      .from("user_profiles")
      .update({
        credits_remaining: newRemaining,
        credits_used: newUsed,
        total_kits_generated: newTotal,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await admin.from("credit_logs").insert({
      user_id: user.id,
      action: "deduct",
      credits_change: -1,
      reason: "Kit generation",
    });

    // Low-credit notification
    if (newRemaining === 0) {
      await admin.from("notifications").insert({
        user_id: user.id,
        title: "You're out of credits",
        message: "Upgrade your plan to continue generating marketing kits.",
        type: "credits_empty",
      });
    } else if (newRemaining <= 3) {
      await admin.from("notifications").insert({
        user_id: user.id,
        title: `Only ${newRemaining} credit${newRemaining === 1 ? "" : "s"} left`,
        message: "Consider upgrading to keep your campaigns running.",
        type: "credits_low",
      });
    }

    return NextResponse.json({
      ok: true,
      kit,
      credits_remaining: newRemaining,
    });
  } catch (err) {
    console.error("Unhandled /api/generate error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
