import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20 max-w-3xl">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="font-display text-4xl font-light md:text-5xl">Privacy Policy</h1>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Last updated:</strong> August 2026</p>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Information We Collect</h2>
            <p className="mt-2">We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you place an order or contact us through our website.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">How We Use Your Information</h2>
            <p className="mt-2">We use the information we collect to process your orders, communicate with you about your purchases, and improve our products and services. We do not sell or share your personal data with third parties for marketing purposes.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Cookies</h2>
            <p className="mt-2">Our website uses cookies to enhance your browsing experience, remember your preferences, and analyse site traffic. You can manage cookie preferences through your browser settings.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Data Security</h2>
            <p className="mt-2">We take reasonable measures to protect your personal information from unauthorised access, alteration, or disclosure. However, no method of electronic storage is 100% secure.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Your Rights</h2>
            <p className="mt-2">You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:care@tuskel.com" className="link-underline">care@tuskel.com</a> for any privacy-related requests.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Contact</h2>
            <p className="mt-2">For questions about this policy, please reach out to <a href="mailto:care@tuskel.com" className="link-underline">care@tuskel.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
