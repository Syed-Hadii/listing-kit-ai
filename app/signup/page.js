"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Card";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Ensure profile exists (fallback if trigger doesn't fire immediately)
    if (data?.user?.id) {
      try {
        await supabase.from("user_profiles").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: "user",
          current_plan: "free_trial",
          subscription_status: "free_trial",
          credits_remaining: 5,
        });
      } catch (err) {
        // Profile may already exist from trigger - that's OK
        console.log("Profile insert (expected if trigger fired):", err.message);
      }
    }

    toast.success(
      "Please go to your inbox and confirm your email to complete signup.",
      {
        duration: 5000,
      },
    );
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <div className="px-6 py-5">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md card">
          <h1 className="font-display text-2xl font-bold text-brand-navy">
            Start Free
          </h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            5 free credits. No credit card required.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              label="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Agent"
            />
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-brand-navy/60 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-navy font-semibold hover:text-brand-gold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
