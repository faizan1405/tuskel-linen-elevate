import Link from "next/link";

const faqs = [
  { q: "What sizes do you offer?", a: "Tuskel shirts are available in S, M, L, XL, 2XL, and 3XL. Please refer to our size guide for exact measurements." },
  { q: "Is pure linen suitable for the Indian climate?", a: "Absolutely. Leno is one of the oldest fibres used in warm climates. It is highly breathable, wicks moisture, and feels cool against the skin — making it ideal for Indian summers." },
  { q: "How do I care for my linen shirt?", a: "Machine wash cold on a gentle cycle. Do not bleach. Line dry in shade. Warm iron while slightly damp. Linen softens beautifully with every wash." },
  { q: "What is the difference between Pure Linen and Linen Blend?", a: "Pure Linen is 100% linen — raw, textured, and utterly breathable. Linen Blend mixes linen with cotton for a softer hand and reduced wrinkling, while keeping the linen character." },
  { q: "Do you offer free shipping?", a: "Yes, we ship free across India on all orders." },
  { q: "What is your return policy?", a: "Unworn items can be returned or exchanged within 7 days of delivery. The product must be in its original condition with all tags attached." },
  { q: "How long does delivery take?", a: "Orders are dispatched from Delhi within 1-2 working days. Delivery typically takes 3-6 working days across India." },
  { q: "Do you ship internationally?", a: "We currently ship within India only. International shipping is coming soon — join our newsletter to be notified." },
  { q: "Are the colours accurate in photos?", a: "We photograph every shirt in natural daylight. However, screen settings vary — if you have questions about a specific shade, please reach out." },
  { q: "Can I cancel or change my order?", a: "Contact us within 1 hour of placing your order and we will try to accommodate changes. Once dispatched, orders cannot be modified." },
];

export default function FAQPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Help</p>
          <h1 className="font-display text-4xl font-light md:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">Everything you need to know about Tuskel — sizing, fabric, shipping, and more.</p>
        </div>
        <div className="mt-16 space-y-0 divide-y divide-border">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-6">
              <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium list-none">
                {faq.q}
                <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-16 rounded-lg border border-border p-8 text-center">
          <p className="font-display text-xl font-light">Still have questions?</p>
          <p className="mt-2 text-sm text-muted-foreground">We&apos;re here to help.</p>
          <Link href="/contact" className="mt-4 inline-block min-h-11 border border-foreground px-8 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-foreground hover:text-primary-foreground transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
