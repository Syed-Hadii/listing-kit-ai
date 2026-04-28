export const metadata = {
  title: "Privacy Policy | Listing Kit AI",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy">
        Privacy Policy
      </h1>
      <p className="mt-3 text-brand-navy/70">
        Listing Kit AI is a product owned and operated by Saad&apos;s
        Production. We are committed to protecting your privacy and handling
        your information responsibly.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">
          Information We Collect
        </h2>
        <ul className="mt-3 list-disc pl-6 text-brand-navy/70 space-y-1">
          <li>Full name</li>
          <li>Email address</li>
          <li>Account login details</li>
          <li>Billing or plan selection information</li>
          <li>Property details you submit for content generation</li>
          <li>
            Usage activity such as credits used, generated kits, and platform
            interactions
          </li>
          <li>
            Technical data such as browser type, device type, and IP address for
            security purposes
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">
          How We Use Your Information
        </h2>
        <ul className="mt-3 list-disc pl-6 text-brand-navy/70 space-y-1">
          <li>Create and manage your account</li>
          <li>Generate AI marketing kits based on your property inputs</li>
          <li>Improve platform performance and user experience</li>
          <li>Provide customer support</li>
          <li>Prevent abuse, fraud, or unauthorized access</li>
          <li>Process upgrades, subscriptions, or billing requests</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">
          Data Protection
        </h2>
        <p className="mt-3 text-brand-navy/70">
          We use secure third-party infrastructure including hosting,
          authentication, and database systems. While no system is 100% risk
          free, we take reasonable steps to protect your data.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Data Sharing</h2>
        <p className="mt-3 text-brand-navy/70">
          We do not sell your personal data. We may use trusted service
          providers such as payment processors, hosting companies, analytics
          tools, and email systems when required to operate the platform.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">
          Your Responsibility
        </h2>
        <p className="mt-3 text-brand-navy/70">
          Please avoid submitting confidential legal, financial, or sensitive
          client data into the platform.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Updates</h2>
        <p className="mt-3 text-brand-navy/70">
          This Privacy Policy may be updated periodically.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-navy">Contact</h2>
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
            Email:{" "}
            <a
              href="mailto:business@saadsproduction.com"
              className="text-brand-navy font-semibold hover:text-brand-gold"
            >
              business@saadsproduction.com
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
