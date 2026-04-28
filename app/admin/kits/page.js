"use client";
import { useEffect, useState, useMemo } from "react";
import { Search, Eye } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

const SECTIONS = [
  { key: "instagram_caption", label: "Instagram Caption" },
  { key: "reel_script", label: "Reel Script" },
  { key: "email_blast", label: "Email Blast" },
  { key: "ad_copy", label: "Ad Copy" },
];

export default function AdminKitsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("marketing_kits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      
      if (data && data.length > 0) {
        // Fetch user profiles separately
        const userIds = [...new Set(data.map(k => k.user_id))];
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, email, full_name")
          .in("id", userIds);
        
        const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);
        const enrichedData = data.map(k => ({
          ...k,
          user_profiles: profileMap[k.user_id],
        }));
        setRows(enrichedData);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter((k) =>
      (k.location || "").toLowerCase().includes(s) ||
      (k.property_type || "").toLowerCase().includes(s) ||
      (k.user_profiles?.email || "").toLowerCase().includes(s)
    );
  }, [rows, search]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Generated Kits</h1>
        <p className="text-brand-navy/60 mt-1">{rows.length} total · showing latest 200</p>
      </div>

      <Card className="!p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy/40" size={16} />
          <input className="input pl-10" placeholder="Search by location, type, or user email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-brand-cream/50 text-brand-navy/70 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Property</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Audience</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-right px-4 py-3">View</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-navy/50">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-brand-navy/50">No kits match.</td></tr>}
              {filtered.map((k) => (
                <tr key={k.id} className="border-t border-brand-navy/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-navy">{k.user_profiles?.full_name || "—"}</p>
                    <p className="text-xs text-brand-navy/60">{k.user_profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant="gold">{k.property_type}</Badge></td>
                  <td className="px-4 py-3 font-medium">{k.location}</td>
                  <td className="px-4 py-3">{k.price}</td>
                  <td className="px-4 py-3 capitalize text-xs">{k.target_audience}</td>
                  <td className="px-4 py-3 text-brand-navy/60">{formatDate(k.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setViewing(k)}><Eye size={12} /> View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Kit — ${viewing.location}` : ""} size="xl">
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="gold">{viewing.property_type}</Badge>
              <Badge>{viewing.price}</Badge>
              {viewing.target_audience && <Badge variant="blue" className="capitalize">{viewing.target_audience}</Badge>}
              {viewing.tone && <Badge className="capitalize">{viewing.tone}</Badge>}
              {viewing.language && <Badge variant="gray">{viewing.language}</Badge>}
            </div>
            {SECTIONS.map((s) => (
              <div key={s.key}>
                <h4 className="font-bold text-brand-navy mb-2">{s.label}</h4>
                <div className="kit-text bg-brand-cream/40 rounded-xl p-4 border border-brand-navy/5 text-sm">{viewing[s.key] || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
