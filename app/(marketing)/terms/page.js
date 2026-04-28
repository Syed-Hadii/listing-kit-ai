export const metadata = {
  title: "Terms of Service | Listing Kit AI",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">
        Terms of Service
      </h1>
      <p className="mt-3 text-brand-navy/70">
        Welcome to Listing Kit AI, a product by Saad&apos;s Production. By using
        this platform, you agree to the following terms.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Service Use</h2>
        <p className="mt-3 text-brand-navy/70">
          Listing Kit AI provides AI generated real estate marketing content
          such as captions, ads, reel scripts, emails, and listing assets. You
          are responsible for reviewing and approving all generated content
          before publishing or using it publicly.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">
          Acceptable Use
        </h2>
        <p className="mt-3 text-brand-navy/70">
          You agree not to use the platform for:
        </p>
        <ul className="mt-3 list-disc pl-6 text-brand-navy/70 space-y-1">
          <li>Spam or mass unsolicited marketing</li>
          <li>False or misleading property advertising</li>
          <li>Illegal activities</li>
          <li>Copyright infringement</li>
          <li>Abuse, hacking, scraping, or system misuse</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Accounts</h2>
        <p className="mt-3 text-brand-navy/70">
          You are responsible for maintaining your login credentials and account
          activity.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">
          Plans, Credits, and Payments
        </h2>
        <p className="mt-3 text-brand-navy/70">
          Paid plans, credits, and subscriptions may be updated over time.
          Unless stated otherwise, purchases are non refundable once credits are
          used. Manual payment approval may apply for selected plans.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Availability</h2>
        <p className="mt-3 text-brand-navy/70">
          We aim for reliable uptime, but uninterrupted service cannot be
          guaranteed.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Termination</h2>
        <p className="mt-3 text-brand-navy/70">
          We reserve the right to suspend or terminate accounts involved in
          misuse or policy violations.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Contact</h2>
        <div className="mt-3 text-brand-navy/70 space-y-1">
          <p>Saad&apos;s Production</p>
          <p>
            Email:{" "}
            <a
              href="mailto:business@saadsproduction.com"
              className="text-brand-navy font-semibold hover:text-brand-gold"
            >
              business@saadsproduction.com
            </a>
          </p>
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
            Phone:{" "}
            <a
              href="tel:+923461367126"
              className="text-brand-navy font-semibold hover:text-brand-gold"
            >
              +92 346 1367126
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
