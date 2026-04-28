 /**
 * AI Provider Abstraction
 * --------------------------------------------------------------
 * Default provider: Google Gemini (cheapest per-token for MVP).
 * Switch provider by setting AI_PROVIDER env var to "openai" or "claude".
 * Each provider implements the same generateMarketingKit(prompt) contract
 * returning a string (expected to be JSON).
 */

const PROVIDER = (process.env.AI_PROVIDER || "anthropic").toLowerCase();

function normalizePrompt(prompt) {
  if (typeof prompt === "string") {
    return { system: "", user: prompt };
  }
  if (prompt && typeof prompt === "object") {
    return {
      system: prompt.system || "",
      user: prompt.user || "",
    };
  }
  return { system: "", user: "" };
}

// -------------------- MOCK (For Testing - No API Calls) --------------------
async function mockGenerate(prompt) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return JSON.stringify({
    instagram_caption: "JUST LISTED: Modern 3BR/2BA in a prime neighborhood. Bright open living, designer kitchen, and a backyard made for hosting.\n\nHighlights:\n- Open floor plan\n- Updated kitchen and baths\n- Mature landscaping\n- Move-in ready\n\nBook your private tour today. DM to schedule.\n\n#RealEstate #HomesForSale #JustListed #DreamHome #OpenHouse #HomeSearch #NewListing #Property",
    reel_script: "Hook: \"This is the kind of home buyers wait all year for.\"\nScene breakdown: Exterior drone shot, bright living room, chef's kitchen, backyard reveal.\nSuggested visuals: Wide shots, detail closeups, lifestyle moments.\nVoiceover lines: \"3 bedrooms, 2 baths, and a layout that actually works for daily life.\"\nClosing CTA: \"Message me to book your private showing.\"",
    email_blast: "Subject: A fresh listing you will want to see\nPreview: Modern, move-in ready, and perfectly located.\n\nHi there,\n\nI just listed a home that checks every box for today’s buyers: clean design, smart layout, and a location that makes daily life easy.\n\nHighlights include a bright open plan, updated kitchen and baths, and a backyard built for weekend hosting. If you have been waiting for the right fit, this is worth a look.\n\nReply to this email or click here to schedule a private tour: [SCHEDULE LINK]\n\nBest regards,\n[Agent Name]",
    ad_copy: "Version A - Buyer/Lifestyle\nHeadline: Modern 3BR Home in a Prime Location\nPrimary Text: Bright, updated, and move-in ready. Open living, designer kitchen, and a backyard made for hosting. Book your private tour today.\nCTA: Book Now\n\nVersion B - Investor/Opportunity (when relevant)\nHeadline: Strong-Value Listing in a High-Demand Area\nPrimary Text: Clean updates, desirable location, and wide buyer appeal. A solid opportunity for long-term value.\nCTA: Learn More"
  });
}

// -------------------- GEMINI --------------------
async function geminiGenerate(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const normalized = normalizePrompt(prompt);
  const combinedPrompt = [normalized.system, normalized.user].filter(Boolean).join("\n\n");

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature: 0.85,
        topP: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

// -------------------- OPENAI (stub, fully implemented) --------------------
async function openaiGenerate(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const normalized = normalizePrompt(prompt);
  const messages = [];
  if (normalized.system) {
    messages.push({ role: "system", content: normalized.system });
  }
  messages.push({ role: "user", content: normalized.user });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.85,
      response_format: { type: "json_object" },
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI API error: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}

// -------------------- CLAUDE (stub, fully implemented) --------------------
async function claudeGenerate(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const normalized = normalizePrompt(prompt);
  if (!normalized.user) throw new Error("Claude prompt is empty");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL,
      max_tokens: 2048,
      temperature: 0.85,
      system: normalized.system || undefined,
      messages: [{ role: "user", content: normalized.user }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude API error: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || "";
  if (!text) throw new Error("Claude returned an empty response");
  return text;
}

// -------------------- PUBLIC API --------------------
export async function generateMarketingKit(prompt) {
  switch (PROVIDER) {
    case "mock":
      return mockGenerate(prompt);
    case "openai":
      return openaiGenerate(prompt);
    case "claude":
    case "anthropic":
      return claudeGenerate(prompt);
    case "gemini":
    default:
      return geminiGenerate(prompt);
  }
}

export function getCurrentProvider() {
  return PROVIDER;
}

/**
 * Safe JSON parser — Gemini sometimes returns stray markdown fences.
 */
export function safeParseJSON(text) {
  if (!text) return null;
  let cleaned = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences
  cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  // Sometimes models prepend/append narrative text; extract first {...} block
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
