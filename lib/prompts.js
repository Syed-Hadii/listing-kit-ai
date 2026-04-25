/**
 * Builds a high-quality, structured prompt for the AI provider.
 * Returns a single string. Model should return JSON matching the schema below.
 */
export function buildMarketingKitPrompt(input) {
  const {
    property_type,
    location,
    price,
    bedrooms,
    bathrooms,
    square_footage,
    key_features,
    property_description,
    target_audience,
    tone,
    platform_focus,
    language,
  } = input;

  return `You are a senior real estate marketing copywriter writing for a top-producing agent.
You produce premium, conversion-focused marketing copy — never generic, never spammy, never cliché.

=============================
PROPERTY BRIEF
=============================
- Property type: ${property_type || "N/A"}
- Location: ${location || "N/A"}
- Price: ${price || "N/A"}
- Bedrooms: ${bedrooms || "N/A"}
- Bathrooms: ${bathrooms || "N/A"}
- Square footage: ${square_footage || "N/A"}
- Key features: ${key_features || "N/A"}
- Additional description: ${property_description || "N/A"}

=============================
CAMPAIGN DIRECTION
=============================
- Target audience: ${target_audience || "general buyer"}
- Tone: ${tone || "professional"}
- Platform focus: ${platform_focus || "All Platforms"}
- Output language: ${language || "English"}

=============================
RULES
=============================
1. Write EVERYTHING in ${language || "English"}.
2. Match the selected tone precisely — do not mix tones.
3. Speak directly to the specified audience; use their motivations (investors care about ROI, families about lifestyle, luxury buyers about status, first-time buyers about ease, sellers about market, relocation about simplicity).
4. Use strong scroll-stopping hooks. No "Welcome to this beautiful home" openings. No "A rare gem".
5. Be concise. Every line must earn its place.
6. Always include a clear call to action with next step (DM, link in bio, reply, book tour).
7. Avoid forbidden spam words: "unbelievable deal", "must see", "won't last", "once in a lifetime" (unless tone=bold).
8. Include emojis only sparingly on Instagram/Reels and only if tone fits.
9. Hashtags: 8–12 real-estate relevant hashtags, mix of broad + local + niche.

=============================
OUTPUT FORMAT
=============================
Return ONLY a single valid JSON object — no markdown, no commentary, no code fences.
Use this exact schema (all keys required, all values as strings):

{
  "instagram_caption": "Full Instagram caption including hook, body, highlights, CTA, and hashtags (separated by blank lines for readability).",
  "reel_script": "Full reel script. Include: [HOOK 0–3s], [SCENE 1], [SCENE 2], [SCENE 3], [VOICEOVER], [ON-SCREEN TEXT], [CTA]. Use clear labeled sections separated by newlines.",
  "email_blast": "Full email. First line: 'Subject: ...'. Second line: 'Preview: ...'. Then blank line, then email body with greeting, 2–3 short paragraphs, clear CTA, and sign-off.",
  "ad_copy": "Facebook/Instagram ad. Include labeled sections:\\nHeadline: ...\\nPrimary Text: ...\\nDescription: ...\\nCTA Button: ... (choose one of: Learn More, Contact Us, Book Now, Get Offer, Send Message)",
  "linkedin_post": "Authority-style LinkedIn listing post — 4–6 short paragraphs, professional voice, leads with insight or market observation, ends with CTA.",
  "property_description_output": "Polished MLS-style property description, 120–180 words, elegant and factual, no hype, no emojis."
}

Begin.`;
}
