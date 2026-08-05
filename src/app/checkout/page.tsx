"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";



const field = "min-h-11 w-full border-b border-border bg-transparent px-1 py-2 text-[14px] focus:border-foreground focus:outline-none";

export default function Page() {
  const { lines, subtotal, discount, total } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState(false);
  const [sameBilling, setSameBilling] = useState(true);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.get("email") ?? ""))) next["email"] = "Enter a valid email address.";
    if (String(data.get("name") ?? "").trim().length < 2) next["name"] = "Enter your full name.";
    if (!/^[0-9]{10}$/.test(String(data.get("phone") ?? ""))) next["phone"] = "Enter a 10-digit mobile number.";
    if (String(data.get("address") ?? "").trim().length < 6) next["address"] = "Enter your street address.";
    if (!/^[0-9]{6}$/.test(String(data.get("pincode") ?? ""))) next["pincode"] = "Enter a 6-digit postcode.";
    setErrors(next);
    if (Object.keys(next).length === 0) setPlaced(true);
  }

  if (placed) {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow mb-4">Prototype</p>
        <h1 className="font-display text-4xl font-light">Your details check out</h1>
        <p className="mt-4 max-w-md text-[15px] text-muted-foreground">
          This is a demonstration checkout, so no payment has been taken and no order placed. Connect a payment provider to complete the flow.
        </p>
        <Link href="/shop" className="mt-8 min-h-12 bg-foreground px-8 py-3.5 text-[11px] tracking-[0.18em] text-primary-foreground uppercase">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="shell pb-24 pt-10">
      <h1 className="font-display text-4xl font-light md:text-5xl">Checkout</h1>
      <div className="mt-10 grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <form onSubmit={submit} noValidate className="space-y-12">
          <fieldset>
            <legend className="eyebrow mb-5">Contact information</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label htmlFor="email" className="text-[12px] text-muted-foreground">Email</label><input id="email" name="email" type="email" className={field} aria-invalid={!!errors["email"]} />{errors["email"] && <p role="alert" className="mt-1 text-[12px] text-destructive">{errors["email"]}</p>}</div>
              <div><label htmlFor="phone" className="text-[12px] text-muted-foreground">Mobile number</label><input id="phone" name="phone" inputMode="numeric" className={field} aria-invalid={!!errors["phone"]} />{errors["phone"] && <p role="alert" className="mt-1 text-[12px] text-destructive">{errors["phone"]}</p>}</div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-5">Shipping address</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><label htmlFor="name" className="text-[12px] text-muted-foreground">Full name</label><input id="name" name="name" className={field} aria-invalid={!!errors["name"]} />{errors["name"] && <p role="alert" className="mt-1 text-[12px] text-destructive">{errors["name"]}</p>}</div>
              <div className="sm:col-span-2"><label htmlFor="address" className="text-[12px] text-muted-foreground">Address</label><input id="address" name="address" className={field} aria-invalid={!!errors["address"]} />{errors["address"] && <p role="alert" className="mt-1 text-[12px] text-destructive">{errors["address"]}</p>}</div>
              <div><label htmlFor="city" className="text-[12px] text-muted-foreground">City</label><input id="city" name="city" className={field} /></div>
              <div><label htmlFor="state" className="text-[12px] text-muted-foreground">State</label><input id="state" name="state" className={field} /></div>
              <div><label htmlFor="pincode" className="text-[12px] text-muted-foreground">Postcode</label><input id="pincode" name="pincode" inputMode="numeric" className={field} aria-invalid={!!errors["pincode"]} />{errors["pincode"] && <p role="alert" className="mt-1 text-[12px] text-destructive">{errors["pincode"]}</p>}</div>
            </div>
            <label className="mt-5 flex items-center gap-2.5 text-[13px]">
              <input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} className="h-3.5 w-3.5" />
              Billing address is the same as shipping
            </label>
            {!sameBilling && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2"><label htmlFor="baddress" className="text-[12px] text-muted-foreground">Billing address</label><input id="baddress" name="baddress" className={field} /></div>
                <div><label htmlFor="bcity" className="text-[12px] text-muted-foreground">City</label><input id="bcity" name="bcity" className={field} /></div>
                <div><label htmlFor="bpin" className="text-[12px] text-muted-foreground">Postcode</label><input id="bpin" name="bpin" inputMode="numeric" className={field} /></div>
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-5">Shipping method</legend>
            <div className="space-y-2">
              {[["standard", "Standard — 3–6 working days", "Free"], ["express", "Express — 1–3 working days", "₹199"]].map(([v, label, price]) => (
                <label key={v} className="flex min-h-12 items-center justify-between border border-border px-4 text-[13px]">
                  <span className="flex items-center gap-3"><input type="radio" name="shipping" value={v} defaultChecked={v === "standard"} /> {label}</span>
                  <span className="text-muted-foreground">{price}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-5">Payment</legend>
            <div className="space-y-2">
              {["UPI", "Credit or debit card", "Net banking", "Cash on delivery"].map((m, i) => (
                <label key={m} className="flex min-h-12 items-center gap-3 border border-border px-4 text-[13px]">
                  <input type="radio" name="payment" defaultChecked={i === 0} /> {m}
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> This prototype does not process live payments.</p>
          </fieldset>

          <button type="submit" className="min-h-12 w-full bg-foreground text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase">Review and Place Order</button>
        </form>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <h2 className="eyebrow mb-5">Order summary</h2>
          <ul className="divide-y divide-border border-y border-border">
            {lines.length === 0 && <li className="py-6 text-[13px] text-muted-foreground">Your bag is empty. <Link href="/shop" className="underline">Add a shirt</Link>.</li>}
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`} className="flex gap-4 py-4">
                <img src={l.product.images[0]} alt="" loading="lazy" className="h-24 w-19 object-cover" />
                <div className="flex-1 text-[13px]">
                  <p className="font-medium">{l.product.name}</p>
                  <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Size {l.size} · Qty {l.qty}</p>
                </div>
                <p className="text-[13px]">{inr(l.product.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-2.5 py-5 text-[14px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>−{inr(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
            <div className="flex justify-between border-t border-border pt-3 font-medium"><span>Total</span><span>{inr(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
