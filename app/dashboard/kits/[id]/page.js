"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Copy, Check, Trash2, RefreshCw, MapPin } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const SECTION_META = [
  { key: "instagram_caption", label: "Instagram Caption" },
  { key: "reel_script", label: "Reel Script" },
  { key: "email_blast", label: "Email Blast" },
  { key: "ad_copy", label: "Facebook / IG Ad"},
];

export default function KitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("marketing_kits").select("*").eq("id", id).single();
      setKit(data);
      setLoading(false);
    }
    load();
  }, [id]);

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

  async function onRegenerate() {
    if (!confirm("Regenerate this kit? This will use 1 credit.")) return;
    setRegenLoading(true);
    const tId = toast.loading("Regenerating…");
    const payload = {
      property_type: kit.property_type,
      location: kit.location,
      price: kit.price,
      bedrooms: kit.bedrooms,
      bathrooms: kit.bathrooms,
      square_footage: kit.square_footage,
      key_features: kit.key_features,
      property_description: kit.property_description,
      target_audience: kit.target_audience,
      tone: kit.tone,
      platform_focus: kit.platform_focus,
      language: kit.language,
    };
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error, { id: tId }); setRegenLoading(false); return; }
      toast.success("Regenerated! Redirecting…", { id: tId });
      router.push(`/dashboard/kits/${data.kit.id}`);
      router.refresh();
    } catch (e) {
      toast.error("Network error", { id: tId });
      setRegenLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this kit permanently?")) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("marketing_kits").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    router.push("/dashboard/kits");
  }

  if (loading) return <div className="card text-center text-brand-navy/60">Loading…</div>;
  if (!kit) return <div className="card text-center text-brand-navy/60">Kit not found.</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <Link href="/dashboard/kits" className="inline-flex items-center gap-1 text-sm text-brand-navy/60 hover:text-brand-navy">
        <ArrowLeft size={14} /> Back to Saved Kits
      </Link>

      <Card className="bg-navy-gradient text-white border-brand-gold/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="gold">{kit.property_type}</Badge>
              {kit.target_audience && <Badge className="bg-white/10 text-white capitalize">{kit.target_audience}</Badge>}
              {kit.tone && <Badge className="bg-white/10 text-white capitalize">{kit.tone}</Badge>}
              {kit.language && <Badge className="bg-white/10 text-white">{kit.language}</Badge>}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <MapPin className="text-brand-gold" size={22} /> {kit.location}
            </h1>
            <p className="text-white/70 mt-1">{kit.price} · Created {formatDate(kit.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="gold" onClick={copyFull}>
              {copied === "full" ? <Check size={14} /> : <Copy size={14} />} Copy Full Kit
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={onRegenerate} disabled={regenLoading}>
              <RefreshCw size={14} className={regenLoading ? "animate-spin" : ""} /> Regenerate
            </Button>
            <Button variant="danger" onClick={onDelete}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </Card>

      {SECTION_META.map((s) => (
        <Card key={s.key}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"> 
              <h3 className="font-bold text-brand-navy text-lg">{s.label}</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => copy(kit[s.key], s.key)}>
              {copied === s.key ? <Check size={14} /> : <Copy size={14} />} {copied === s.key ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="kit-text bg-brand-cream/40 rounded-xl p-4 border border-brand-navy/5">{kit[s.key]}</div>
        </Card>
      ))}
    </div>
  );
}
