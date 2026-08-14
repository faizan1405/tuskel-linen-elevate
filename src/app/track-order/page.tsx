"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeading } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNo.trim()) return;
    router.push(`/orders?orderNo=${encodeURIComponent(orderNo.trim())}`);
  };

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Track Order" }]} />
      <div className="py-12 md:py-20 max-w-lg">
        <p className="eyebrow mb-4">Track Your Order</p>
        <h1 className="font-display text-4xl font-light md:text-5xl">Track Order</h1>
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">Enter your order number and email to check the status of your shipment.</p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Order Number *</label>
            <Input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="e.g. TSK-0001" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <Button type="submit" className="w-full">Track Order</Button>
        </form>
      </div>
    </div>
  );
}
