import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20 max-w-3xl">
        <p className="eyebrow mb-4">Policies</p>
        <h1 className="font-display text-4xl font-light md:text-5xl">Returns & Exchanges</h1>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <div className="flex gap-4 rounded-lg border border-border p-6">
            <RotateCcw className="h-6 w-6 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="font-display text-xl font-light text-foreground">7-Day Easy Returns</h2>
              <p className="mt-2">We want you to love your Tuskel shirt. If you are not satisfied, you can return or exchange unworn items within 7 days of delivery.</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Conditions for Return</h2>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Item must be unworn, unwashed, and in original condition with all tags attached.</li>
              <li>Original packaging and invoice must be included.</li>
              <li>Items showing signs of wear, washing, or alteration cannot be returned.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">How to Initiate a Return</h2>
            <p className="mt-2">Contact us at <a href="mailto:care@tuskel.com" className="link-underline">care@tuskel.com</a> or <a href="tel:+918859538859" className="link-underline">+91 88595 38859</a> with your order number. We will guide you through the return process and provide a prepaid return label.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Refunds</h2>
            <p className="mt-2">Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be issued to the original payment method. Shipping charges are non-refundable.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Exchanges</h2>
            <p className="mt-2">If you need a different size or colour, we are happy to help with an exchange. Contact our team with your order details and we will arrange the swap.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
