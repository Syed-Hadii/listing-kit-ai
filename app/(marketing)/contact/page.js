export const metadata = {
  title: "Contact Us | Listing Kit AI",
};

export default function ContactUsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">
        Contact Us
      </h1>
      <p className="mt-3 text-brand-navy/70">
        We are here to help with support, billing, onboarding, and
        partnerships.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">General Support</h2>
        <p className="mt-3 text-brand-navy/70">
          <a
            href="mailto:business@saadsproduction.com"
            className="text-brand-navy font-semibold hover:text-brand-gold"
          >
            business@saadsproduction.com
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">
          Sales / Partnerships
        </h2>
        <p className="mt-3 text-brand-navy/70">
          <a
            href="mailto:business@saadsproduction.com"
            className="text-brand-navy font-semibold hover:text-brand-gold"
          >
            business@saadsproduction.com
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Billing Questions</h2>
        <p className="mt-3 text-brand-navy/70">
          <a
            href="mailto:business@saadsproduction.com"
            className="text-brand-navy font-semibold hover:text-brand-gold"
          >
            business@saadsproduction.com
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Company</h2>
        <div className="mt-3 text-brand-navy/70 space-y-1">
          <p>Saad&apos;s Production</p>
          <p>
            Website:{" "}
            <a
              href="https://www.saadsproduction.com"
              className="text-brand-navy font-semibold hover:text-brand-gold"
              target="_blank"
              rel="noreferrer"
            >
              www.saadsproduction.com
            </a>
          </p>
          <p>
            WhatsApp / Phone:{" "}
            <a
              href="tel:+923461367126"
              className="text-brand-navy font-semibold hover:text-brand-gold"
            >
              +92 346 1367126
            </a>
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Response Time</h2>
        <p className="mt-3 text-brand-navy/70">Usually within 24 business hours.</p>
      </section>
    </div>
  );
}
