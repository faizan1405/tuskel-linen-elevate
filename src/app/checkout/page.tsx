"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";

const field =
  "min-h-11 w-full border-b border-border bg-transparent px-1 py-2 text-[14px] focus:border-foreground focus:outline-none";

interface ConfirmedOrder {
  id?: string;
  orderNo: string;
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  items: Array<{
    slug: string;
    name: string;
    size: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: string;
  placedOn: string;
}

export default function CheckoutPage() {
  const { lines, subtotal, discount, total, coupon, clearCart, removeCoupon } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [sameBilling, setSameBilling] = useState(true);

  // Form field state for controlled submission
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingCost = shippingMethod === "express" ? 199 : 0;
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    if (lines.length === 0) {
      toast.error("Your bag is empty. Please add items before placing an order.");
      return;
    }

    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      next["email"] = "Enter a valid email address.";
    }
    if (formData.name.trim().length < 2) {
      next["name"] = "Enter your full name.";
    }
    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      next["phone"] = "Enter a 10-digit mobile number.";
    }
    if (formData.address.trim().length < 5) {
      next["address"] = "Enter your street address.";
    }
    if (formData.city.trim().length < 2) {
      next["city"] = "Enter your city.";
    }
    if (formData.state.trim().length < 2) {
      next["state"] = "Enter your state.";
    }
    if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      next["pincode"] = "Enter a 6-digit postcode.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fill in all required shipping details.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
          },
          items: lines.map((l) => ({
            slug: l.slug,
            size: l.size,
            qty: l.qty,
          })),
          coupon: coupon || undefined,
          shippingMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const errorMsg = data.error || "Unable to place your order. Please check your details.";
        setServerError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Order created successfully on server
      clearCart();
      removeCoupon();
      setConfirmedOrder(data.order);
      setIsSubmitting(false);
      toast.success(`Order ${data.order.orderNo} placed successfully!`);
    } catch (err: any) {
      const msg = err?.message || "A network error occurred. Please check your connection.";
      setServerError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  }

  // ── Confirmation Screen ──────────────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="shell pb-24 pt-12 md:pt-16 max-w-3xl mx-auto">
        <div className="border border-border/80 bg-background p-6 md:p-10 rounded-sm">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
            <span className="eyebrow text-emerald-800 font-semibold">Order Placed Successfully</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-light md:text-4xl">
            Thank you, {confirmedOrder.customer}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your Cash on Delivery order has been confirmed and registered in our system.
          </p>

          {/* Order Details Bar */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Order Number
              </p>
              <p className="mt-1 font-mono font-medium">{confirmedOrder.orderNo}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </p>
              <p className="mt-1">{confirmedOrder.placedOn}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Payment
              </p>
              <p className="mt-1 font-medium text-emerald-700">Cash on Delivery</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Total Due
              </p>
              <p className="mt-1 font-semibold tabular-nums">{inr(confirmedOrder.total)}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mt-6 rounded-sm bg-secondary/40 p-4">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
              Delivery Address
            </p>
            <p className="mt-1 text-sm font-medium">{confirmedOrder.customer}</p>
            <p className="text-sm text-muted-foreground">{confirmedOrder.shippingAddress}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Phone: {confirmedOrder.phone} · Email: {confirmedOrder.email}
            </p>
          </div>

          {/* Ordered Items */}
          <div className="mt-6">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Items Ordered
            </p>
            <ul className="divide-y divide-border border-y border-border text-sm">
              {confirmedOrder.items.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium">{it.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Size {it.size} × {it.qty}
                    </span>
                  </div>
                  <span className="tabular-nums font-medium">{inr(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Summary */}
          <div className="mt-6 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{inr(confirmedOrder.subtotal)}</span>
            </div>
            {confirmedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="tabular-nums">−{inr(confirmedOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{confirmedOrder.shipping === 0 ? "Free" : inr(confirmedOrder.shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Amount Due on Delivery</span>
              <span className="tabular-nums">{inr(confirmedOrder.total)}</span>
            </div>
          </div>

          {/* Instructions note */}
          <div className="mt-8 flex items-start gap-3 rounded-sm border border-border bg-secondary/30 p-4 text-[13px] text-muted-foreground">
            <Truck className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
            <p>
              Please keep <strong>{inr(confirmedOrder.total)}</strong> in cash ready at the time of delivery. Our courier partner will deliver your package directly to your doorstep.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="flex min-h-12 flex-1 items-center justify-center bg-foreground px-8 text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form Screen ─────────────────────────────────────────────────────
  return (
    <div className="shell pb-24 pt-10">
      <h1 className="font-display text-4xl font-light md:text-5xl">Checkout</h1>

      {serverError && (
        <div className="mt-6 flex items-center gap-3 border border-destructive/40 bg-destructive/10 p-4 text-destructive rounded-sm text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <div className="mt-10 grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <form onSubmit={submit} noValidate className="space-y-12">
          {/* Contact information */}
          <fieldset>
            <legend className="eyebrow mb-5">Contact information</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="text-[12px] text-muted-foreground">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={field}
                  aria-invalid={!!errors["email"]}
                  required
                />
                {errors["email"] && (
                  <p role="alert" className="mt-1 text-[12px] text-destructive">
                    {errors["email"]}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="text-[12px] text-muted-foreground">
                  Mobile number (10 digits) *
                </label>
                <input
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={field}
                  aria-invalid={!!errors["phone"]}
                  required
                />
                {errors["phone"] && (
                  <p role="alert" className="mt-1 text-[12px] text-destructive">
                    {errors["phone"]}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Shipping address */}
          <fieldset>
            <legend className="eyebrow mb-5">Shipping address</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="text-[12px] text-muted-foreground">
                  Full name *
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={field}
                  aria-invalid={!!errors["name"]}
                  required
                />
                {errors["name"] && (
                  <p role="alert" className="mt-1 text-[12px] text-destructive">
                    {errors["name"]}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="text-[12px] text-muted-foreground">
                  Street address *
                </label>
                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={field}
                  aria-invalid={!!errors["address"]}
                  required
                />
                {errors["address"] && (
                  <p role="alert" className="mt-1 text-[12px] text-destructive">
                    {errors["address"]}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="city" className="text-[12px] text-muted-foreground">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={field}
                  aria-invalid={!!errors["city"]}
                  required
                />
                {errors["city"] && (
                  <p role="alert" className="mt-1 text-[12px] text-destructive">
                    {errors["city"]}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="state" className="text-[12px] text-muted-foreground">
                  State *
                </label>
                <input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className={field}
                  aria-invalid={!!errors["state"]}
                  required
                />
                {errors["state"] && (
                  <p role="alert" className="mt-1 text-[12px] text-destructive">
                    {errors["state"]}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="pincode" className="text-[12px] text-muted-foreground">
                  Postcode (6 digits) *
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  inputMode="numeric"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  className={field}
                  aria-invalid={!!errors["pincode"]}
                  required
                />
                {errors["pincode"] && (
                  <p role="alert" className="mt-1 text-[12px] text-destructive">
                    {errors["pincode"]}
                  </p>
                )}
              </div>
            </div>

            <label className="mt-5 flex items-center gap-2.5 text-[13px]">
              <input
                type="checkbox"
                checked={sameBilling}
                onChange={(e) => setSameBilling(e.target.checked)}
                className="h-3.5 w-3.5 accent-foreground"
              />
              Billing address is the same as shipping
            </label>
          </fieldset>

          {/* Shipping method */}
          <fieldset>
            <legend className="eyebrow mb-5">Shipping method</legend>
            <div className="space-y-2">
              <label
                className={`flex min-h-12 items-center justify-between border px-4 text-[13px] cursor-pointer transition-colors ${
                  shippingMethod === "standard" ? "border-foreground bg-secondary/30" : "border-border"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                    className="accent-foreground"
                  />
                  Standard — 3–6 working days
                </span>
                <span className="text-muted-foreground">Free</span>
              </label>
              <label
                className={`flex min-h-12 items-center justify-between border px-4 text-[13px] cursor-pointer transition-colors ${
                  shippingMethod === "express" ? "border-foreground bg-secondary/30" : "border-border"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="accent-foreground"
                  />
                  Express — 1–3 working days
                </span>
                <span className="text-muted-foreground">₹199</span>
              </label>
            </div>
          </fieldset>

          {/* Payment method — COD Only for launch */}
          <fieldset>
            <legend className="eyebrow mb-5">Payment Method</legend>
            <div className="space-y-2">
              <label className="flex min-h-14 items-center justify-between border border-foreground bg-secondary/40 px-4 text-[13px] cursor-pointer">
                <span className="flex items-center gap-3 font-medium">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    defaultChecked
                    className="accent-foreground"
                    readOnly
                  />
                  Cash on Delivery (COD)
                </span>
                <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  Available
                </span>
              </label>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pay with cash when your package arrives at your doorstep. No advance payment required.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting || lines.length === 0}
            className="flex min-h-12 w-full items-center justify-center bg-foreground text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Placing Order…
              </span>
            ) : (
              `Confirm Order — Pay ${inr(grandTotal)} on Delivery`
            )}
          </button>
        </form>

        {/* Order summary sidebar */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <h2 className="eyebrow mb-5">Order summary</h2>
          <ul className="divide-y divide-border border-y border-border">
            {lines.length === 0 && (
              <li className="py-6 text-[13px] text-muted-foreground">
                Your bag is empty.{" "}
                <Link href="/shop" className="underline">
                  Add a shirt
                </Link>
                .
              </li>
            )}
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`} className="flex gap-4 py-4">
                <img
                  src={l.product.images[0]}
                  alt={l.product.name}
                  loading="lazy"
                  className="h-24 w-19 object-cover"
                />
                <div className="flex-1 text-[13px]">
                  <p className="font-medium">{l.product.name}</p>
                  <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                    Size {l.size} · Qty {l.qty}
                  </p>
                </div>
                <p className="text-[13px] font-medium">{inr(l.product.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-2.5 py-5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{inr(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span className="text-muted-foreground">Discount ({coupon})</span>
                <span className="tabular-nums">−{inr(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : inr(shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-semibold text-[15px]">
              <span>Total to Pay (COD)</span>
              <span className="tabular-nums">{inr(grandTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
