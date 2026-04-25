import Link from "next/link";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { PLANS } from "@/lib/plans";
import { Check } from "lucide-react";

export const metadata = { title: "Pricing — Listing Kit AI" };

export default function PricingPage() {
  return (
    <div className="bg-brand-cream min-h-screen">
      <MarketingNav />
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-8 text-center">
        <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-3">Pricing</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-brand-navy">
          Plans built for agents
        </h1>
        <p className="mt-4 text-brand-navy/60 max-w-xl mx-auto">
          Start free, scale when your listings do. All plans include every AI format.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-6 relative flex flex-col ${
                p.popular
                  ? "bg-brand-navy text-white border-2 border-brand-gold shadow-luxury"
                  : "bg-white border border-brand-navy/10 shadow-card"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-brand-navy text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
              )}
              <h3 className={`text-lg font-bold ${p.popular ? "text-white" : "text-brand-navy"}`}>{p.name}</h3>
              <p className={`text-xs mt-1 ${p.popular ? "text-white/60" : "text-brand-navy/60"}`}>{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className={`text-5xl font-bold font-display ${p.popular ? "text-white" : "text-brand-navy"}`}>${p.price}</span>
                <span className={`text-sm ${p.popular ? "text-white/60" : "text-brand-navy/60"}`}>{p.price > 0 ? "/mo" : ""}</span>
              </div>
              <p className={`mt-2 text-sm font-bold ${p.popular ? "text-brand-gold" : "text-brand-goldDark"}`}>
                {p.credits} credits{p.price > 0 ? "/month" : ""}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className={`mt-0.5 flex-shrink-0 ${p.popular ? "text-brand-gold" : "text-brand-goldDark"}`} />
                    <span className={p.popular ? "text-white/85" : "text-brand-navy/80"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={p.id === "free_trial" ? "/signup" : "/signup?plan=" + p.id}
                className={`mt-6 btn w-full ${p.popular ? "btn-gold" : "btn-primary"}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 card p-8 max-w-3xl mx-auto">
          <h3 className="font-bold text-brand-navy text-lg">How payment works</h3>
          <p className="mt-2 text-sm text-brand-navy/70 leading-relaxed">
            All paid plans are processed manually through <span className="font-semibold text-brand-navy">Payoneer</span>. After
            choosing a plan, a request is created inside your dashboard. Saad's Production will send your
            secure Payoneer payment link directly to your billing page. Once the payment is confirmed, your
            plan activates instantly — credits are added and you can start generating.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
