"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Welcome back!");
    const redirect = params.get("redirect") || "/dashboard";
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <div className="px-6 py-5"><Logo /></div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md card p-8">
          <h1 className="font-display text-2xl font-bold text-brand-navy">Welcome back</h1>
          <p className="text-sm text-brand-navy/60 mt-1">Log in to your Listing Kit AI account.</p>

          {params.get("disabled") === "1" && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              Your account has been disabled. Contact support.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-brand-navy/60 text-center">
            New here? <Link href="/signup" className="text-brand-navy font-semibold hover:text-brand-gold">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
