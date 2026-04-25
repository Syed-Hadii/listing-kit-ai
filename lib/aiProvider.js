 /**
 * AI Provider Abstraction
 * --------------------------------------------------------------
 * Default provider: Google Gemini (cheapest per-token for MVP).
 * Switch provider by setting AI_PROVIDER env var to "openai" or "claude".
 * Each provider implements the same generateMarketingKit(prompt) contract
 * returning a string (expected to be JSON).
 */

const PROVIDER = (process.env.AI_PROVIDER || "anthropic").toLowerCase();

// -------------------- MOCK (For Testing - No API Calls) --------------------
async function mockGenerate(prompt) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return JSON.stringify({
    instagram_caption: "🏡 STUNNING 3BR/2BA HOME\n\nNestled in one of the most sought-after neighborhoods, this beautiful home offers everything you've been looking for. Modern finishes, spacious living areas, and a backyard perfect for entertaining.\n\n✨ Open floor plan\n✨ Updated kitchen & bathrooms  \n✨ Large lot with mature trees\n✨ Move-in ready!\n\nSchedule your showing TODAY! Link in bio 📲\n\n#RealEstate #HomesForSale #DreamHome #PropertyListing #RealEstateAgent #HomeSelling #NewListing #OpenHouse",
    reel_script: "[HOOK - 0-3s]\nVoiceover: 'What if I told you your dream home exists... and it's only minutes away?'\nOn-screen text: 'DREAM HOME ALERT!'\n\n[SCENE 1 - 3-6s]\nB-roll: Exterior shot of beautiful home, drone flying over property\nVoiceover: 'This stunning 3-bedroom has everything you've been searching for...'\nOn-screen text: '3 BR | 2 BA | UPDATED'\n\n[SCENE 2 - 6-10s]\nB-roll: Interior shots - modern kitchen, spacious living room, master bedroom\nVoiceover: 'Modern finishes throughout, plenty of natural light, and move-in ready.'\nOn-screen text: 'MOVE-IN READY'\n\n[SCENE 3 - 10-14s]\nB-roll: Backyard space, entertaining area, neighborhood shots\nVoiceover: 'Perfect for entertaining with a beautiful backyard and prime location.'\nOn-screen text: 'ENTERTAINING READY'\n\n[CTA - 14-15s]\nVoiceover: 'Don't miss out! Link in bio to schedule your tour today.'\nOn-screen text: 'SCHEDULE NOW → LINK IN BIO'",
    email_blast: "Subject: Your Dream Home is Waiting 🏡\nPreview: This stunning 3BR is exactly what you've been looking for!\n\nHi there,\n\nI'm thrilled to share an exclusive opportunity with you. This beautifully updated 3-bedroom, 2-bathroom home in our most desirable neighborhood just hit the market, and I have a feeling it's going to move fast.\n\nWhy this home is special:\n• Completely updated kitchen with stainless steel appliances\n• Spacious open floor plan perfect for modern living\n• Large master suite with walk-in closet\n• Mature landscaping and privacy fencing\n• Excellent schools and walkable neighborhood\n\nThis isn't just a house—it's a home waiting for your family. The current owners have lovingly maintained every detail, and it shows.\n\nI'd love to show you around. Are you available this weekend for a private tour?\n\nReply to this email or click here to schedule: [SCHEDULE LINK]\n\nBest regards,\n[Agent Name]\nLicensed Real Estate Agent",
    ad_copy: "Headline: Stunning 3BR Home in Prime Location\n\nPrimary Text: Discover your dream home! This beautiful 3-bedroom, 2-bathroom residence features modern updates, open floor plan, and move-in ready condition. Perfect location near top-rated schools.\n\nDescription: Located in one of the most sought-after neighborhoods, this property offers spacious living, updated kitchen and bathrooms, and a gorgeous backyard. Don't miss this opportunity!\n\nCTA Button: Schedule Tour",
    linkedin_post: "🏠 Just Listed: A Rare Opportunity in Our Market\n\nThe real estate market rewards those who act decisively. Today, I'm excited to introduce a property that checks every box—updated, spacious, and located in one of our community's most coveted neighborhoods.\n\nThis 3BR/2BA home represents more than square footage and amenities. It's about location, condition, and timing. It's about understanding that real estate value isn't just measured in price—it's measured in potential.\n\nFor investors: This is a solid addition to any portfolio in an appreciating area.\nFor families: This is where memories are made.\n\nIn my 15+ years in real estate, I've learned that the best opportunities don't wait. They're discovered, presented, and secured by those who understand the market.\n\nIf you're looking to move or invest, let's talk. The right property could be closer than you think.\n\n📲 DM me for exclusive showing details\n#RealEstate #HomesForSale #PropertyInvestment #RealEstateMarket",
    property_description_output: "Welcome to this meticulously maintained 3-bedroom, 2-bathroom residence situated in one of the community's most desirable neighborhoods. This home features a recently updated kitchen with stainless steel appliances, elegant flooring throughout, and an open floor plan that maximizes natural light and space. The master suite includes a generous walk-in closet and spa-like bathroom. Outside, mature landscaping and a private fenced yard provide the perfect setting for relaxation and entertainment. Move-in ready and waiting for its next family. Conveniently located near excellent schools, shopping, and dining."
  });
}

// -------------------- GEMINI --------------------
async function geminiGenerate(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
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

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
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

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-4-1",
      max_tokens: 2048,
      temperature: 0.85,
      messages: [{ role: "user", content: prompt }],
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
