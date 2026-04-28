"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Sparkles, Check, Copy, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Luxury Villa", "Penthouse", "Duplex", "Apartment", "Loft", "Land / Lot", "Commercial"];
const AUDIENCES = ["investor", "family buyer", "luxury buyer", "first-time buyer", "seller audience", "relocation buyer"];
const TONES = ["luxury", "professional", "friendly", "bold", "investor-focused", "emotional storytelling"];
const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "Email", "All Platforms"];
const LANGS = ["English", "French", "Spanish"];

const SECTION_META = [
  { key: "instagram_caption", label: "Instagram Caption" },
  { key: "reel_script", label: "Reel Script" },
  { key: "email_blast", label: "Email Blast" },
  { key: "ad_copy", label: "Facebook / IG Ad"},
];

export default function NewKitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    property_type: "Single Family",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    square_footage: "",
    key_features: "",
    property_description: "",
    target_audience: "family buyer",
    tone: "professional",
    platform_focus: "All Platforms",
    language: "English",
  });
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState(null);
  const [copied, setCopied] = useState("");

  function update(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function onGenerate(e) {
    e?.preventDefault();
    if (!form.location || !form.price) {
      toast.error("Location and price are required.");
      return;
    }
    setLoading(true);
    setKit(null);
    const tId = toast.loading("Generating your marketing kit…");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Generation failed", { id: tId });
        setLoading(false);
        return;
      }
      toast.success("Your kit is ready!", { id: tId });
      setKit(data.kit);
      router.refresh();
    } catch (err) {
      toast.error("Network error", { id: tId });
    } finally {
      setLoading(false);
    }
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text || "");
    setCopied(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(""), 1500);
  }

  function copyFull() {
    if (!kit) return;
    const combined = SECTION_META.map((s) => `## ${s.label}\n\n${kit[s.key]}`).join("\n\n---\n\n");
    copy(combined, "full");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Create New Kit</h1>
        <p className="text-brand-navy/60 mt-1">Fill in the property details. One generation uses 1 credit.</p>
      </div>

      {!kit && (
        <Card>
          <form onSubmit={onGenerate} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <Select label="Property type" value={form.property_type} onChange={(e) => update("property_type", e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Input label="Location *" placeholder="e.g. Beverly Hills, CA" value={form.location} onChange={(e) => update("location", e.target.value)} required />
              <Input label="Price *" placeholder="e.g. $2,450,000" value={form.price} onChange={(e) => update("price", e.target.value)} required />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Beds" placeholder="4" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
                <Input label="Baths" placeholder="3.5" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
                <Input label="Sq ft" placeholder="3,200" value={form.square_footage} onChange={(e) => update("square_footage", e.target.value)} />
              </div>
            </div>

            <Textarea label="Key features" placeholder="Pool, smart home, chef's kitchen, ocean view…" value={form.key_features} onChange={(e) => update("key_features", e.target.value)} />
            <Textarea label="Additional property description" placeholder="Anything else the AI should know about this listing." value={form.property_description} onChange={(e) => update("property_description", e.target.value)} />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select label="Target audience" value={form.target_audience} onChange={(e) => update("target_audience", e.target.value)}>
                {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
              <Select label="Tone" value={form.tone} onChange={(e) => update("tone", e.target.value)}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Select label="Platform focus" value={form.platform_focus} onChange={(e) => update("platform_focus", e.target.value)}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Select label="Language" value={form.language} onChange={(e) => update("language", e.target.value)}>
                {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="gold" size="lg" disabled={loading}>
                <Sparkles size={16} /> {loading ? "Generating…" : "Generate Kit (1 credit)"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && !kit && (
        <Card>
          <div className="flex flex-col items-center py-12">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-brand-gold/20" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-gold border-t-transparent animate-spin" />
            </div>
            <p className="mt-4 font-display text-xl text-brand-navy">Crafting your marketing kit…</p>
            <p className="mt-1 text-sm text-brand-navy/60">This usually takes 10–25 seconds</p>
          </div>
        </Card>
      )}

      {kit && (
        <div className="space-y-5 animate-slide-up">
          <div className="card p-5 bg-emerald-50 border-emerald-200 flex items-start gap-3">
            <Check className="text-emerald-600 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-bold text-emerald-800">Kit generated and auto-saved</p>
              <p className="text-sm text-emerald-700">Find it anytime inside Saved Kits.</p>
            </div>
            <Button variant="outline" onClick={copyFull} className="border-emerald-300 text-emerald-700 hover:text-emerald-900">
              {copied === "full" ? <Check size={14} /> : <Copy size={14} />} Copy Full Kit
            </Button>
          </div>

          {SECTION_META.map((s) => (
            <Card key={s.key}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"> 
                  <h3 className="font-bold text-brand-navy text-lg">{s.label}</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => copy(kit[s.key], s.key)}>
                  {copied === s.key ? <Check size={14} /> : <Copy size={14} />}
                  {copied === s.key ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="kit-text bg-brand-cream/40 rounded-xl p-4 border border-brand-navy/5">{kit[s.key]}</div>
            </Card>
          ))}

          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={() => { setKit(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <Plus size={16} /> Generate Another Kit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
