import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20 max-w-3xl">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="font-display text-4xl font-light md:text-5xl">Terms and Conditions</h1>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Last updated:</strong> August 2026</p>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Acceptance of Terms</h2>
            <p className="mt-2">By accessing or using the Tuskel website, you agree to be bound by these terms and conditions. If you do not agree, please do not use our website.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Products and Pricing</h2>
            <p className="mt-2">We strive to display accurate product information and pricing. However, we reserve the right to correct any errors and to change prices at any time without prior notice.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Orders and Payment</h2>
            <p className="mt-2">All orders are subject to acceptance and availability. We accept UPI, Visa, Mastercard, RuPay, Net Banking, and Cash on Delivery. Payment must be received before order dispatch.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Intellectual Property</h2>
            <p className="mt-2">All content on this website — including text, images, logos, and designs — is the property of Tuskel and protected by copyright law. You may not reproduce, distribute, or create derivative works without our written permission.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Limitation of Liability</h2>
            <p className="mt-2">Tuskel shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid by you for the relevant product.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Governing Law</h2>
            <p className="mt-2">These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Delhi, India.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Contact</h2>
            <p className="mt-2">For questions about these terms, please contact <a href="mailto:care@tuskel.com" className="link-underline">care@tuskel.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
