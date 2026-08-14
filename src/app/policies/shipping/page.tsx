import Link from "next/link";
import { Truck, RotateCcw } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20 max-w-3xl">
        <p className="eyebrow mb-4">Policies</p>
        <h1 className="font-display text-4xl font-light md:text-5xl">Shipping & Delivery</h1>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <div className="flex gap-4 rounded-lg border border-border p-6">
            <Truck className="h-6 w-6 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="font-display text-xl font-light text-foreground">Free Shipping Across India</h2>
              <p className="mt-2">We offer complimentary shipping on all orders within India. No minimum purchase required.</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Dispatch Time</h2>
            <p className="mt-2">Orders are dispatched from our Delhi warehouse within 1-2 working days of confirmation. You will receive a shipping confirmation email with tracking details once your order is on its way.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Delivery Time</h2>
            <p className="mt-2">Standard delivery takes 3-6 working days, depending on your location. Metro cities typically receive orders within 2-3 days. Remote areas may take up to 7 days.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Tracking</h2>
            <p className="mt-2">Use the order number from your confirmation email on our <Link href="/track-order" className="link-underline">track order</Link> page to check real-time delivery status.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Delivery Address</h2>
            <p className="mt-2">Please ensure your delivery address is accurate and complete. We are not responsible for orders delivered to incorrect addresses provided at checkout.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-light text-foreground">Failed Deliveries</h2>
            <p className="mt-2">If a delivery attempt fails, the courier will make a second attempt the next working day. After two failed attempts, the order will be returned to us and a re-shipping fee will apply.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
