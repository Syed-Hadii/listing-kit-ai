"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, MapPin, Filter } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card, Input, Select } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default function SavedKitsPage() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("marketing_kits")
        .select(
          "id, property_type, location, price, target_audience, tone, created_at",
        )
        .order("created_at", { ascending: false });
      setKits(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function onDelete(id) {
    if (!confirm("Delete this kit? This cannot be undone.")) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("marketing_kits")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kit deleted");
    setKits((p) => p.filter((k) => k.id !== id));
  }

  const types = useMemo(
    () => [...new Set(kits.map((k) => k.property_type).filter(Boolean))],
    [kits],
  );

  const filtered = useMemo(() => {
    let out = [...kits];
    if (search)
      out = out.filter((k) =>
        (k.location || "").toLowerCase().includes(search.toLowerCase()),
      );
    if (typeFilter) out = out.filter((k) => k.property_type === typeFilter);
    if (sort === "oldest")
      out.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return out;
  }, [kits, search, typeFilter, sort]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">
            Saved Kits
          </h1>
          <p className="text-brand-navy/60 mt-1">
            {kits.length} kit{kits.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <Link href="/dashboard/new-kit" className="btn btn-gold">
          <Plus size={16} /> New Kit
        </Link>
      </div>

      {kits.length > 0 && (
        <Card className="!p-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy/40"
                size={16}
              />
              <input
                className="input pl-10"
                placeholder="Search by location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All property types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </Select>
          </div>
        </Card>
      )}

      {loading ? (
        <Card>
          <p className="text-brand-navy/60 text-center py-8">Loading…</p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={
            kits.length === 0
              ? "No saved kits yet"
              : "No kits match your filters"
          }
          description={
            kits.length === 0
              ? "Generate your first kit to see it here."
              : "Try clearing the search or filter."
          }
          action={
            kits.length === 0 ? (
              <Link href="/dashboard/new-kit" className="btn btn-gold">
                <Plus size={16} /> Create Your First Kit
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((k) => (
            <Card
              key={k.id}
              className="!p-5 hover:border-brand-gold/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="gold">{k.property_type}</Badge>
                <span className="text-xs text-brand-navy/50">
                  {formatDate(k.created_at)}
                </span>
              </div>
              <Link href={`/dashboard/kits/${k.id}`} className="block">
                <h3 className="font-bold text-brand-navy flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-gold" />
                  {k.location}
                </h3>
                <p className="text-sm text-brand-navy/60 mt-1">{k.price}</p>
                {k.target_audience && (
                  <p className="text-xs text-brand-navy/50 mt-1 capitalize">
                    {k.target_audience} · {k.tone}
                  </p>
                )}
              </Link>
              <div className="flex gap-2 mt-4">
                <Link
                  href={`/dashboard/kits/${k.id}`}
                  className="btn btn-primary btn-sm flex-1"
                >
                  View
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(k.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
