"use client";
import { useState } from "react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package } from "lucide-react";

export default function TrackOrderPage() {
  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNo.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Track Order" }]} />
      <div className="py-12 md:py-20 max-w-lg">
        <p className="eyebrow mb-4">Delivery Status</p>
        <h1 className="font-display text-4xl font-light md:text-5xl">Track Order</h1>

        {submitted ? (
          <div className="mt-8 border border-border p-6 rounded-sm bg-secondary/30">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
              <p className="font-medium text-foreground">Order Inquiry Received</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Order <strong>{orderNo}</strong> is being processed by our fulfillment team. Order tracking will be shared once your order is dispatched. For assistance, please contact our support team.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              For assistance, please contact our support team at <strong>tuskelclothingco@gmail.com</strong>.
            </p>
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="mt-5 text-xs uppercase tracking-wider"
            >
              Check another order
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
              Enter your order number and email to check the status of your shipment.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Number *</label>
                <Input
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="e.g. TSK-123456"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Track Order
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
