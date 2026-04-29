import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import {
  generateMarketingKit,
  getCurrentProvider,
  safeParseJSON,
} from "@/lib/aiProvider";
import { buildMarketingKitPrompt } from "@/lib/prompts";
import { validateGenerateRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const provider = getCurrentProvider();
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated", code: "auth_required" },
        { status: 401 },
      );
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select(
        "id, credits_remaining, credits_used, total_kits_generated, is_disabled",
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found", code: "profile_missing" },
        { status: 404 },
      );
    }
    if (profile.is_disabled) {
      return NextResponse.json(
        { error: "Account disabled", code: "account_disabled" },
        { status: 403 },
      );
    }
    if ((profile.credits_remaining ?? 0) <= 0) {
      return NextResponse.json(
        {
          error: "No credits remaining. Please upgrade your plan.",
          code: "no_credits",
        },
        { status: 402 },
      );
    }

    const body = await request.json();

    // Validate input
    const validation = validateGenerateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid request",
          code: "invalid_request",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    // Build prompt
    const prompt = buildMarketingKitPrompt(body);

    // Call AI provider (retry once on invalid JSON)
    let rawText;
    let parsed = null;
    let requestError = null;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        rawText = await generateMarketingKit(prompt);
        parsed = safeParseJSON(rawText);
        if (parsed) break;
        console.warn("AI returned invalid JSON, retrying:", {
          attempt,
          provider,
        });
      } catch (err) {
        requestError = err;
        break;
      }
    }

    if (requestError) {
      console.error("AI generation failed:", requestError);
      return NextResponse.json(
        {
          error:
            "AI generation failed. Please try again. No credit was charged.",
          code: "ai_request_failed",
          details: requestError?.message || "Unknown AI error",
          provider,
        },
        { status: 502 },
      );
    }

    if (!parsed) {
      console.error("AI returned invalid JSON:", rawText?.slice(0, 500));
      return NextResponse.json(
        {
          error:
            "AI returned invalid format. Please try again. No credit was charged.",
          code: "ai_invalid_json",
          details: "AI response was not valid JSON.",
          provider,
        },
        { status: 502 },
      );
    }

    // Validate required keys
    const needed = [
      "instagram_caption",
      "reel_script",
      "email_blast",
      "ad_copy",
    ];
    for (const k of needed) {
      if (!parsed[k] || typeof parsed[k] !== "string") {
        console.error("Missing key in AI response:", k);
        return NextResponse.json(
          {
            error:
              "Incomplete AI response. Please try again. No credit was charged.",
            code: "ai_missing_key",
            details: `Missing or invalid key: ${k}`,
            provider,
          },
          { status: 502 },
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
    };

    const { data: kit, error: kitError } = await admin
      .from("marketing_kits")
      .insert(kitRow)
      .select("*")
      .single();

    if (kitError) {
      console.error("Kit save failed:", kitError);
      return NextResponse.json(
        {
          error: "Failed to save kit. No credit was charged.",
          code: "kit_save_failed",
          details: kitError?.message || "Unknown database error",
        },
        { status: 500 },
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
      {
        error: "Unexpected server error.",
        code: "unexpected_error",
        details: err?.message || "Unknown server error",
      },
      { status: 500 },
    );
  }
}
