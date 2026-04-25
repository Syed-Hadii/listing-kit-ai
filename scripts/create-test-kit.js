#!/usr/bin/env node

/**
 * Quick Test Kit Creator Script
 * Creates a marketing kit using actual Anthropic API (same as frontend)
 * Usage: node scripts/create-test-kit.js <user-id>
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { generateMarketingKit, safeParseJSON } from "../lib/aiProvider.js";
import { buildMarketingKitPrompt } from "../lib/prompts.js";

// Load .env.local
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTestKit(userId) {
  console.log("🚀 Creating test kit with Anthropic API...\n");

  try {
    // Step 1: Verify user exists
    console.log(`✓ Checking user profile...`);
    const { data: profile, error: profileError } = await admin
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error(`❌ User not found: ${userId}`);
      process.exit(1);
    }

    console.log(`✓ Found user: ${profile.email}`);
    console.log(`  Credits: ${profile.credits_remaining} | Plan: ${profile.current_plan}`);

    if ((profile.credits_remaining ?? 0) <= 0) {
      console.error(`❌ User has no credits!`);
      process.exit(1);
    }

    // Step 2: Build prompt with test property
    const formData = {
      property_type: "Luxury Villa",
      location: "Beverly Hills, CA 90210",
      price: "$8,750,000",
      bedrooms: "6",
      bathrooms: "7",
      square_footage: "12,500",
      key_features: "Infinity pool, smart home automation, wine cellar, home theater, guest house, mature landscaping",
      property_description: "Stunning luxury villa in the heart of Beverly Hills with panoramic city views",
      target_audience: "luxury buyer",
      tone: "luxury",
      platform_focus: "All Platforms",
      language: "English",
    };

    console.log(`\n✓ Building prompt for:`);
    console.log(`  Property: ${formData.property_type}`);
    console.log(`  Location: ${formData.location}`);
    console.log(`  Price: ${formData.price}`);

    const prompt = buildMarketingKitPrompt(formData);

    // Step 3: Call Claude API
    console.log(`\n⏳ Calling Anthropic Claude API...`);
    let rawText;
    try {
      rawText = await generateMarketingKit(prompt);
      console.log(`✓ API response received`);
    } catch (err) {
      console.error(`❌ AI generation failed: ${err.message}`);
      process.exit(1);
    }

    // Step 4: Parse response
    console.log(`✓ Parsing AI response...`);
    const parsed = safeParseJSON(rawText);
    if (!parsed) {
      console.error(`❌ Invalid JSON from AI`);
      console.error(`Raw response: ${rawText?.slice(0, 500)}`);
      process.exit(1);
    }

    // Step 5: Validate required fields
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
        console.error(`❌ Missing or invalid field: ${k}`);
        process.exit(1);
      }
    }

    console.log(`✓ All fields validated`);

    // Step 6: Save kit to database
    console.log(`\n✓ Saving kit to database...`);
    const kitData = {
      user_id: userId,
      property_type: formData.property_type,
      location: formData.location,
      price: formData.price,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      square_footage: formData.square_footage,
      key_features: formData.key_features,
      property_description: formData.property_description,
      target_audience: formData.target_audience,
      tone: formData.tone,
      platform_focus: formData.platform_focus,
      language: formData.language,
      instagram_caption: parsed.instagram_caption,
      reel_script: parsed.reel_script,
      email_blast: parsed.email_blast,
      ad_copy: parsed.ad_copy,
      linkedin_post: parsed.linkedin_post,
      property_description_output: parsed.property_description_output,
    };

    const { data: kit, error: kitError } = await admin
      .from("marketing_kits")
      .insert(kitData)
      .select("*")
      .single();

    if (kitError) {
      console.error(`❌ Failed to save kit: ${kitError.message}`);
      process.exit(1);
    }

    console.log(`✓ Kit created with ID: ${kit.id}`);

    // Step 7: Deduct 1 credit
    console.log(`\n✓ Deducting 1 credit...`);
    const newCredits = Math.max(0, profile.credits_remaining - 1);

    const { error: updateError } = await admin
      .from("user_profiles")
      .update({
        credits_remaining: newCredits,
        credits_used: (profile.credits_used ?? 0) + 1,
        total_kits_generated: (profile.total_kits_generated ?? 0) + 1,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error(`❌ Failed to deduct credit: ${updateError.message}`);
      process.exit(1);
    }

    console.log(`✓ Credits updated: ${profile.credits_remaining} → ${newCredits}`);

    // Step 8: Create log entry
    await admin.from("credit_logs").insert({
      user_id: userId,
      action: "deduct",
      credits_change: -1,
      reason: "Test kit generation (CLI script)",
    });

    // Step 9: Create notification if low
    if (newCredits === 0) {
      await admin.from("notifications").insert({
        user_id: userId,
        title: "You're out of credits",
        message: "Upgrade your plan to continue generating kits.",
        type: "credits_empty",
      });
    } else if (newCredits <= 3) {
      await admin.from("notifications").insert({
        user_id: userId,
        title: `Only ${newCredits} credit${newCredits === 1 ? "" : "s"} left`,
        message: "Consider upgrading to keep generating.",
        type: "credits_low",
      });
    }

    console.log("\n✅ SUCCESS! Kit created with Claude API\n");
    console.log("📊 Summary:");
    console.log(`   Kit ID: ${kit.id}`);
    console.log(`   Property: ${kitData.property_type} @ ${kitData.location}`);
    console.log(`   Price: ${kitData.price}`);
    console.log(`   Sections Generated:`);
    console.log(`     ✓ Instagram Caption (${parsed.instagram_caption.length} chars)`);
    console.log(`     ✓ Reel Script (${parsed.reel_script.length} chars)`);
    console.log(`     ✓ Email Blast (${parsed.email_blast.length} chars)`);
    console.log(`     ✓ Ad Copy (${parsed.ad_copy.length} chars)`);
    console.log(`     ✓ LinkedIn Post (${parsed.linkedin_post.length} chars)`);
    console.log(`     ✓ Property Description (${parsed.property_description_output.length} chars)`);
    console.log(`   Credits Remaining: ${newCredits}`);
    console.log(`\n🎯 View your kit: http://localhost:3001/dashboard/kits/${kit.id}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Get user ID from command line
const userId = process.argv[2];
if (!userId) {
  console.log("Usage: node scripts/create-test-kit.js <user-id>");
  console.log("\nExample: node scripts/create-test-kit.js 550e8400-e29b-41d4-a716-446655440000");
  console.log("\n💡 Tip: Find your user ID in Supabase → user_profiles table\n");
  process.exit(1);
}

createTestKit(userId);
