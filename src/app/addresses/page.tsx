"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AddressesPage() {
  const addresses: any[] = [];

  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Account</p>
          <h1 className="font-display text-4xl font-light md:text-5xl">Saved Addresses</h1>
        </div>
        {addresses.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-display text-2xl font-light">No saved addresses</p>
            <p className="mt-3 text-muted-foreground">Save addresses during checkout for faster future orders.</p>
            <Link href="/checkout" className="mt-8 inline-flex items-center gap-2 min-h-12 border border-foreground px-8 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-foreground hover:text-primary-foreground transition-colors">
              Go to Checkout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-5">
                <p className="font-medium">{a.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.line1}, {a.line2}, {a.city} - {a.pincode}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
