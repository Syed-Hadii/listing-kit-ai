"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Card, Input } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("id, email, full_name, current_plan, subscription_status, credits_remaining, role")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setFullName(data?.full_name || "");
    }
    load();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("user_profiles").update({ full_name: fullName }).eq("id", profile.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
    setSaving(false);
  }

  async function updatePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    setNewPassword("");
  }

  if (!profile) return <Card><p className="text-brand-navy/60 text-center py-8">Loading…</p></Card>;

  return (
    <div className="space-y-5 max-w-2xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">Settings</h1>
        <p className="text-brand-navy/60 mt-1">Manage your account profile and security.</p>
      </div>

      <Card>
        <h2 className="font-bold text-brand-navy text-lg">Profile</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <Input label="Email (read-only)" value={profile.email || ""} readOnly disabled />
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div>
            <Button type="submit" variant="gold" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-bold text-brand-navy text-lg">Security</h2>
        <form onSubmit={updatePassword} className="mt-4 space-y-4">
          <Input label="New password" type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          <div>
            <Button type="submit" variant="primary">Update password</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-bold text-brand-navy text-lg">Account info</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-brand-navy/60">Plan</dt><dd className="font-semibold mt-1 capitalize">{profile.current_plan?.replace("_", " ")}</dd></div>
          <div><dt className="text-brand-navy/60">Status</dt><dd className="mt-1"><Badge variant={profile.subscription_status === "active" ? "green" : "gray"}>{profile.subscription_status?.replace("_", " ")}</Badge></dd></div>
          <div><dt className="text-brand-navy/60">Credits</dt><dd className="font-semibold mt-1">{profile.credits_remaining}</dd></div>
          <div><dt className="text-brand-navy/60">Role</dt><dd className="mt-1"><Badge variant={profile.role === "admin" ? "gold" : "default"}>{profile.role}</Badge></dd></div>
        </dl>
      </Card>
    </div>
  );
}
