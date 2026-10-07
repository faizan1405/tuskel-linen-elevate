"use client";
import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, Truck, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { loadRazorpayScript } from "@/lib/payments/load-razorpay";

const field =
  "min-h-11 w-full border-b border-border bg-transparent px-1 py-2 text-[14px] focus:border-foreground focus:outline-none";

interface SavedAddress {
  id: string;
  label: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

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
  paymentStatus?: string;
  status: string;
  placedOn: string;
}

export default function CheckoutPage() {
  const { lines, subtotal, discount, total, coupon, clearCart, removeCoupon } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [onlineAvailable, setOnlineAvailable] = useState<boolean>(false);
  const [sameBilling, setSameBilling] = useState(true);

  // Customer authentication and saved addresses
  const { user, hydrated: authHydrated } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");
  const [saveNewAddress, setSaveNewAddress] = useState(false);

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

  // Check Razorpay online payment availability on mount
  useEffect(() => {
    fetch("/api/payments/razorpay/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.enabled) {
          setOnlineAvailable(true);
        }
      })
      .catch(() => {
        // Online payments remain safely disabled
      });
  }, []);

  const applySavedAddress = (addr: SavedAddress) => {
    const fullStreet = [
      addr.addressLine1,
      addr.addressLine2,
      addr.landmark ? `Near ${addr.landmark}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    setFormData((prev) => ({
      ...prev,
      name: addr.fullName,
      phone: addr.phone,
      address: fullStreet || addr.addressLine1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
    setErrors({});
  };

  useEffect(() => {
    if (!authHydrated || !user) return;
    setFormData((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      name: prev.name || user.name || "",
    }));

    fetch("/api/account/addresses")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.addresses) && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          const defaultAddr =
            data.addresses.find((a: SavedAddress) => a.isDefault) || data.addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            applySavedAddress(defaultAddr);
          }
        }
      })
      .catch(() => {});
  }, [authHydrated, user]);

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
    setPaymentError(null);

    // ── Cash on Delivery Submission ───────────────────────────────────────────
    if (paymentMethod === "cod") {
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

        clearCart();
        removeCoupon();
        setConfirmedOrder(data.order);

        // Save address if requested
        if (user && saveNewAddress && selectedAddressId === "custom") {
          fetch("/api/account/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: formData.name.trim(),
              phone: formData.phone.trim(),
              addressLine1: formData.address.trim(),
              city: formData.city.trim(),
              state: formData.state.trim(),
              pincode: formData.pincode.trim(),
              label: "Home",
            }),
          }).catch(() => {});
        }

        setIsSubmitting(false);
        toast.success(`Order ${data.order.orderNo} placed successfully!`);
      } catch (err: any) {
        const msg = err?.message || "A network error occurred. Please check your connection.";
        setServerError(msg);
        toast.error(msg);
        setIsSubmitting(false);
      }
      return;
    }

    // ── Online Payment (Razorpay) Submission ──────────────────────────────────
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Unable to load secure payment gateway. Please check your internet connection or choose Cash on Delivery."
        );
      }

      const createRes = await fetch("/api/payments/razorpay/create-order", {
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

      const createData = await createRes.json();
      if (!createRes.ok || !createData.ok) {
        const errMsg = createData.error || "Failed to initialize payment. Please try again.";
        setServerError(errMsg);
        toast.error(errMsg);
        setIsSubmitting(false);
        return;
      }

      const RazorpayConstructor = (window as any).Razorpay;
      if (!RazorpayConstructor) {
        throw new Error("Razorpay checkout is unavailable.");
      }

      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency || "INR",
        name: "TUSKEL",
        description: `Order ${createData.orderNo}`,
        order_id: createData.razorpayOrderId,
        prefill: {
          name: createData.customer.name,
          email: createData.customer.email,
          contact: createData.customer.phone,
        },
        theme: {
          color: "#18181b",
        },
        handler: async function (resp: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsSubmitting(true);
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: createData.orderId,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) {
              if (verifyData?.reviewRequired) {
                clearCart();
                removeCoupon();
                setConfirmedOrder(verifyData.order);
                toast.warning("Payment received. Your order has been placed on priority review.");
                return;
              }
              const vErr = verifyData.error || "Payment verification failed. Please contact support.";
              setPaymentError(vErr);
              toast.error(vErr);
              return;
            }

            // Payment successfully verified & stock confirmed
            clearCart();
            removeCoupon();
            setConfirmedOrder(verifyData.order);

            if (user && saveNewAddress && selectedAddressId === "custom") {
              fetch("/api/account/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fullName: formData.name.trim(),
                  phone: formData.phone.trim(),
                  addressLine1: formData.address.trim(),
                  city: formData.city.trim(),
                  state: formData.state.trim(),
                  pincode: formData.pincode.trim(),
                  label: "Home",
                }),
              }).catch(() => {});
            }

            toast.success(`Payment verified! Order ${verifyData.order.orderNo} confirmed.`);
          } catch (err: any) {
            const vErr = err?.message || "Payment verification failed. Please contact support.";
            setPaymentError(vErr);
            toast.error(vErr);
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setPaymentError("Payment was not completed. Your order has not been confirmed.");
          },
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.on("payment.failed", function (response: any) {
        setIsSubmitting(false);
        const reason =
          response?.error?.description ||
          "Payment was not completed. Your order has not been confirmed.";
        setPaymentError(reason);
        toast.error(reason);
      });

      rzp.open();
    } catch (err: any) {
      const msg = err?.message || "Failed to start payment. Please try again.";
      setServerError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  }

  // ── Confirmation Screen ──────────────────────────────────────────────────────
  if (confirmedOrder) {
    const isOnline =
      confirmedOrder.paymentMethod === "Razorpay" ||
      confirmedOrder.paymentMethod === "Paid Online";

    return (
      <div className="shell pb-24 pt-12 md:pt-16 max-w-3xl mx-auto">
        <div className="border border-border/80 bg-background p-6 md:p-10 rounded-sm">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
            <span className="eyebrow text-emerald-800 font-semibold">
              {isOnline ? "Payment Successful & Order Confirmed" : "Order Placed Successfully"}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-light md:text-4xl">
            Thank you, {confirmedOrder.customer}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isOnline
              ? "Your payment has been securely verified and your order is confirmed."
              : "Your Cash on Delivery order has been confirmed and registered in our system."}
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
              <p className="mt-1 font-medium text-emerald-700">
                {isOnline ? "Paid Online (Razorpay)" : "Cash on Delivery"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {isOnline ? "Total Paid" : "Total Due"}
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
              <span>{isOnline ? "Total Paid" : "Amount Due on Delivery"}</span>
              <span className="tabular-nums">{inr(confirmedOrder.total)}</span>
            </div>
          </div>

          {/* Instructions note */}
          {isOnline ? (
            <div className="mt-8 flex items-start gap-3 rounded-sm border border-emerald-200/80 bg-emerald-50/40 p-4 text-[13px] text-emerald-900">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700 mt-0.5" />
              <p>
                Payment of <strong>{inr(confirmedOrder.total)}</strong> was received successfully. We are preparing your order for shipment and will notify you as soon as your package ships.
              </p>
            </div>
          ) : (
            <div className="mt-8 flex items-start gap-3 rounded-sm border border-border bg-secondary/30 p-4 text-[13px] text-muted-foreground">
              <Truck className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
              <p>
                Please keep <strong>{inr(confirmedOrder.total)}</strong> in cash ready at the time of delivery. Our courier partner will deliver your package directly to your doorstep.
              </p>
            </div>
          )}

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

      {paymentError && (
        <div className="mt-6 border border-amber-300 bg-amber-50/70 p-5 rounded-sm text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Payment Not Completed</p>
              <p className="mt-1 text-amber-800 text-[13px]">{paymentError}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentError(null)}
                  className="border border-foreground bg-foreground text-primary-foreground px-4 py-2 text-[11px] font-medium tracking-[0.14em] uppercase hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentError(null);
                    setPaymentMethod("cod");
                  }}
                  className="border border-border bg-background px-4 py-2 text-[11px] font-medium tracking-[0.14em] uppercase hover:bg-secondary transition-colors cursor-pointer"
                >
                  Choose Cash on Delivery
                </button>
              </div>
            </div>
          </div>
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

            {/* Saved Address Selector for Logged-In Customers */}
            {user && savedAddresses.length > 0 && (
              <div className="mb-8 space-y-3">
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground">
                  Deliver to a saved address
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          applySavedAddress(addr);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedAddressId(addr.id);
                            applySavedAddress(addr);
                          }
                        }}
                        className={cn(
                          "cursor-pointer border p-4 text-left transition-all select-none",
                          isSelected
                            ? "border-foreground bg-secondary/30 ring-1 ring-foreground"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium tracking-[0.12em] uppercase">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] uppercase tracking-[0.12em] bg-foreground text-primary-foreground px-1.5 py-0.5">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-[14px] font-medium truncate">{addr.fullName}</p>
                        <p className="mt-1 text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city} — {addr.pincode}
                        </p>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          +91 {addr.phone}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId("custom");
                    setFormData((prev) => ({
                      ...prev,
                      address: "",
                      city: "",
                      state: "",
                      pincode: "",
                    }));
                  }}
                  className={cn(
                    "mt-2 text-[11px] tracking-[0.14em] uppercase underline underline-offset-4 transition-colors cursor-pointer",
                    selectedAddressId === "custom"
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  + Enter a different delivery address
                </button>
              </div>
            )}

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

            {user && selectedAddressId === "custom" && (
              <label className="mt-4 flex items-center gap-2.5 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveNewAddress}
                  onChange={(e) => setSaveNewAddress(e.target.checked)}
                  className="h-3.5 w-3.5 accent-foreground"
                />
                <span>Save this shipping address to my account</span>
              </label>
            )}

            <label className="mt-5 flex items-center gap-2.5 text-[13px] cursor-pointer">
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

          {/* Payment method selection */}
          <fieldset>
            <legend className="eyebrow mb-5">Payment Method</legend>
            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={cn(
                  "flex min-h-16 items-center justify-between border p-4 text-[13px] cursor-pointer transition-colors",
                  paymentMethod === "cod"
                    ? "border-foreground bg-secondary/30 ring-1 ring-foreground"
                    : "border-border hover:border-foreground/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => {
                      setPaymentMethod("cod");
                      setPaymentError(null);
                    }}
                    className="accent-foreground mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-foreground block">Cash on Delivery</span>
                    <span className="text-[12px] text-muted-foreground block mt-0.5">
                      Pay when your order arrives at your doorstep
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded shrink-0">
                  Available
                </span>
              </label>

              {/* Pay Online */}
              <label
                className={cn(
                  "flex min-h-16 items-center justify-between border p-4 text-[13px] transition-colors",
                  onlineAvailable
                    ? paymentMethod === "online"
                      ? "border-foreground bg-secondary/30 ring-1 ring-foreground cursor-pointer"
                      : "border-border hover:border-foreground/40 cursor-pointer"
                    : "border-border/60 bg-muted/20 opacity-75 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    disabled={!onlineAvailable}
                    onChange={() => {
                      if (onlineAvailable) {
                        setPaymentMethod("online");
                        setPaymentError(null);
                      }
                    }}
                    className="accent-foreground mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Pay Online</span>
                      {!onlineAvailable && (
                        <span className="text-[10px] font-medium tracking-wide uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Temporarily Unavailable
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-muted-foreground block mt-0.5">
                      {onlineAvailable
                        ? "UPI, Cards, Net Banking & supported Razorpay methods"
                        : "Online payment temporarily unavailable. Please choose Cash on Delivery."}
                    </span>
                  </div>
                </div>
                {onlineAvailable && (
                  <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded shrink-0">
                    Instant
                  </span>
                )}
              </label>
            </div>

            {paymentMethod === "cod" ? (
              <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pay with cash when your package arrives at your doorstep. No advance payment required.
              </p>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Encrypted & secure 256-bit payment gateway powered by Razorpay.
              </p>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting || lines.length === 0}
            className="flex min-h-12 w-full items-center justify-center bg-foreground text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                {paymentMethod === "online" ? "Opening Secure Payment…" : "Placing Order…"}
              </span>
            ) : paymentMethod === "online" ? (
              `Pay ${inr(grandTotal)} Securely`
            ) : (
              `Place COD Order — Pay ${inr(grandTotal)} on Delivery`
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
                  referrerPolicy="no-referrer"
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
              <span>Total to Pay ({paymentMethod === "online" ? "Online" : "COD"})</span>
              <span className="tabular-nums">{inr(grandTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
