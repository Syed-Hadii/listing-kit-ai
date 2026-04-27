import Link from "next/link";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { PLANS } from "@/lib/plans";
import {
  Sparkles,
  Instagram,
  Film,
  Mail,
  Megaphone,
  Linkedin,
  FileText,
  Clock,
  Target,
  Zap,
  Check,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  { icon: Instagram, title: "Instagram Caption", desc: "Scroll-stopping hook, tight body, CTA, and 10+ relevant hashtags." },
  { icon: Film, title: "Reel Script", desc: "3-second hook, scene-by-scene breakdown, voiceover, on-screen text." },
  { icon: Mail, title: "Email Blast", desc: "Subject, preview text, and a conversion-focused body." },
  { icon: Megaphone, title: "Facebook / IG Ad Copy", desc: "Headline, primary text, description, and CTA button text." },
  { icon: Linkedin, title: "LinkedIn Post", desc: "Authority-style post that builds trust with serious buyers." },
  { icon: FileText, title: "MLS Property Description", desc: "Polished listing copy that reads like a luxury brochure." },
];

const STEPS = [
  { n: "01", title: "Enter your property", desc: "Type, location, price, beds/baths, features — the basics." },
  { n: "02", title: "Pick tone + audience", desc: "Luxury, professional, bold. Investor, family, first-time buyer." },
  { n: "03", title: "Generate full kit", desc: "AI writes every asset, auto-saves it, and you copy & post." },
];

const WHY = [
  { icon: Clock, title: "30-second campaigns", desc: "One form, one click, full kit. Stop staring at blank captions." },
  { icon: Target, title: "Tone + audience aware", desc: "Content speaks to investors, families, or luxury buyers specifically." },
  { icon: Zap, title: "Built for agents", desc: "No generic marketing fluff — real estate conventions, real CTAs." },
];

const FAQ = [
  { q: "How fast is a kit generated?", a: "Typically 10–25 seconds end-to-end using Google Gemini under the hood." },
  { q: "What counts as one credit?", a: "One full marketing kit generation. Regenerating a kit costs one credit; copying and viewing are always free." },
  { q: "How does payment work?", a: "All paid plans are billed manually via Payoneer. After choosing a plan, we send you a secure Payoneer link inside your dashboard. Your plan activates once the payment is confirmed." },
  { q: "Can I cancel anytime?", a: "Yes. Since payments are processed manually per cycle, you simply don't renew — no cancellation fees, ever." },
  { q: "What languages are supported?", a: "English, French, and Spanish. More on the way." },
];

export default function LandingPage() {
  return (
    <div className="bg-brand-cream min-h-screen">
      <MarketingNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy via-brand-navy to-brand-slate" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 10%, #D4AF3740 0, transparent 40%), radial-gradient(circle at 80% 70%, #D4AF3730 0, transparent 50%)",
        }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles size={14} /> AI for Real Estate Agents
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-5xl mx-auto leading-tight">
            Turn Any Property Listing Into a{" "}
            <span className="text-transparent bg-clip-text bg-gold-gradient">Full Marketing Campaign</span>{" "}
            in Seconds
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Listing Kit AI helps real estate agents generate captions, reels, emails, ads,
            and listing copy from one simple property form.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn btn-gold btn-lg text-base">
              Start Free — 5 credits
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-lg bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-brand-gold">
              View Pricing
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/50">No credit card required</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-brand-navy">From listing → campaign in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="card hover:shadow-luxury transition-shadow">
              <div className="font-display text-5xl font-bold text-brand-gold">{s.n}</div>
              <h3 className="mt-4 text-xl font-bold text-brand-navy">{s.title}</h3>
              <p className="mt-2 text-brand-navy/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT IT GENERATES */}
      <section id="what" className="bg-white py-24 border-y border-brand-navy/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-3">What it generates</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-brand-navy">Six assets from one form</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card group hover:border-brand-gold/40 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center group-hover:bg-gold-gradient group-hover:text-brand-navy transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-brand-navy">{f.title}</h3>
                  <p className="mt-1 text-sm text-brand-navy/60">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-3">Why agents use it</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-brand-navy">Close more listings, post less slowly</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {WHY.map((w) => {
            const Icon = w.icon;
            return (
              <div key={w.title} className="card">
                <Icon className="text-brand-gold" size={28} />
                <h3 className="mt-4 text-xl font-bold text-brand-navy">{w.title}</h3>
                <p className="mt-2 text-brand-navy/60">{w.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="bg-brand-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold">Simple, agent-friendly plans</h2>
            <p className="mt-3 text-white/60">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl p-6 relative ${
                  p.popular ? "bg-gold-gradient text-brand-navy" : "bg-white/5 border border-white/10"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-navy text-brand-gold text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                )}
                <h3 className={`text-lg font-bold ${p.popular ? "" : "text-white"}`}>{p.name}</h3>
                <p className={`text-xs mt-1 ${p.popular ? "text-brand-navy/70" : "text-white/60"}`}>{p.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display">${p.price}</span>
                  <span className={`text-sm ${p.popular ? "text-brand-navy/70" : "text-white/60"}`}>
                    {p.price > 0 ? "/mo" : ""}
                  </span>
                </div>
                <p className={`mt-2 text-sm font-semibold ${p.popular ? "" : "text-brand-gold"}`}>
                  {p.credits} credits
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${p.popular ? "text-brand-navy" : "text-brand-gold"}`} />
                      <span className={p.popular ? "" : "text-white/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="btn btn-gold btn-lg">
              See full pricing <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-brand-navy">Questions, answered</h2>
        </div>
        <div className="space-y-4">
          {FAQ.map((f, i) => (
            <details key={i} className="card group">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-brand-navy">
                {f.q}
                <ChevronRight className="group-open:rotate-90 transition-transform text-brand-gold" size={18} />
              </summary>
              <p className="mt-3 text-brand-navy/70 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-navy-gradient text-white p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 30% 30%, #D4AF37 0, transparent 50%)",
          }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to save 5 hours per listing?</h2>
            <p className="mt-3 text-white/70 max-w-xl mx-auto">
              Start free with 5 credits. No card, no setup. Your next campaign is a click away.
            </p>
            <Link href="/signup" className="btn btn-gold btn-lg mt-8">
              Start Free Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
