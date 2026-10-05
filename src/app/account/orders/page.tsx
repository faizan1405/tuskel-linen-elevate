"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useAuth } from "@/lib/auth";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Package,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";

interface OrderItem {
  id: string;
  slug: string;
  name: string;
  size: string;
  qty: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNo: string;
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  placedOn: string;
  updatedOn: string;
  notes?: string | null;
  items: OrderItem[];
}

export default function AccountOrdersPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/account/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.orders)) {
          setOrders(data.orders);
          // By default expand the newest order if only 1 order exists
          if (data.orders.length === 1 && data.orders[0]) {
            setExpandedOrders({ [data.orders[0].orderNo]: true });
          }
        }
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hydrated, user]);

  const toggleExpand = (orderNo: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNo]: !prev[orderNo],
    }));
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let badgeClass = "bg-secondary text-foreground";
    let icon = <Clock className="h-3 w-3" />;

    if (s === "confirmed" || s === "processing") {
      badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300";
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />;
    } else if (s === "shipped") {
      badgeClass = "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300";
      icon = <Truck className="h-3 w-3 text-sky-600 dark:text-sky-400" />;
    } else if (s === "delivered") {
      badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200";
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-700" />;
    } else if (s === "cancelled") {
      badgeClass = "bg-destructive/10 text-destructive border-destructive/20";
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full",
          badgeClass
        )}
      >
        {icon}
        {status}
      </span>
    );
  };

  if (!hydrated) {
    return (
      <div className="shell pb-24">
        <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: "Order History" }]} />
        <div className="mt-8 h-12 w-64 animate-pulse bg-secondary" />
        <div className="mt-8 space-y-4 max-w-3xl">
          <div className="h-40 animate-pulse bg-secondary border border-border" />
          <div className="h-40 animate-pulse bg-secondary border border-border" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell pb-24">
        <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: "Order History" }]} />
        <div className="py-12 max-w-md">
          <h1 className="font-display text-3xl font-light md:text-4xl">Sign in to view orders</h1>
          <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">
            Please sign in with your Google account to access your purchase history, invoices, and delivery tracking.
          </p>
          <div className="mt-8 max-w-xs">
            <GoogleSignInButton />
          </div>
          <div className="mt-6">
            <Link href="/account">
              <Button variant="outline" className="gap-2 text-[11px] tracking-[0.16em] uppercase">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: "Order History" }]} />

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mt-4">
        <div>
          <h1 className="font-display text-4xl font-light md:text-5xl">Order History</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Review past purchases, current fulfillment status, and order receipts.
          </p>
        </div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Account
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 space-y-4 max-w-3xl">
          <div className="h-32 animate-pulse bg-secondary border border-border" />
          <div className="h-32 animate-pulse bg-secondary border border-border" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-12 max-w-2xl border border-dashed border-border px-6 py-20 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground opacity-60" />
          <p className="mt-4 font-display text-2xl font-light">No orders yet</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Any orders placed with <strong>{user.email}</strong> will automatically appear here.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 min-h-12 bg-foreground px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase hover:opacity-90 transition-opacity"
          >
            Start Shopping <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-6 max-w-3xl">
          {orders.map((order) => {
            const isExpanded = Boolean(expandedOrders[order.orderNo]);

            return (
              <div
                key={order.id}
                className="border border-border bg-background transition-shadow hover:shadow-xs"
              >
                {/* Order Summary Header / Clickable Accordion Row */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(order.orderNo)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(order.orderNo);
                    }
                  }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer select-none hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[14px] font-medium tracking-tight">
                        {order.orderNo}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
                      <span>Placed on {order.placedOn}</span>
                      <span>•</span>
                      <span>{order.paymentMethod === "Razorpay" ? "Paid Online" : order.paymentMethod}</span>
                      <span>•</span>
                      <span className="capitalize">{order.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t border-border sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
                        Total
                      </p>
                      <p className="text-[16px] font-medium mt-0.5">{inr(order.total)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                      className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")}
                      />
                    </button>
                  </div>
                </div>

                {/* Items preview (shown briefly on closed or full on open) */}
                <div className="border-t border-border px-5 py-4 sm:px-6">
                  <div className="divide-y divide-border/60">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <Link href={`/product/${item.slug}`} className="shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-16 w-13 object-cover bg-secondary border border-border/40"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-[13px] font-medium link-underline line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            Size: <span className="font-medium text-foreground">{item.size}</span>
                            {"  "}•{"  "}
                            Qty: <span className="font-medium text-foreground">{item.qty}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-medium">{inr(item.price * item.qty)}</p>
                          {item.qty > 1 && (
                            <p className="text-[11px] text-muted-foreground">
                              {inr(item.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Breakdown (visible when expanded) */}
                {isExpanded && (
                  <div className="border-t border-border bg-secondary/20 p-5 sm:p-6 space-y-6 text-[13px]">
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Shipping details */}
                      <div>
                        <p className="eyebrow flex items-center gap-1.5 mb-2">
                          <MapPin className="h-3 w-3" /> Delivery Address
                        </p>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">
                          {order.shippingAddress}
                        </p>
                        <p className="text-muted-foreground mt-1.5 text-[12px]">
                          Phone: {order.phone}
                        </p>
                      </div>

                      {/* Financial breakdown */}
                      <div className="border-t border-border pt-4 sm:border-0 sm:pt-0">
                        <p className="eyebrow mb-2">Order Summary</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{inr(order.subtotal)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                              <span>Discount</span>
                              <span>−{inr(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-muted-foreground">
                            <span>Shipping</span>
                            <span>
                              {order.shipping === 0 ? "Complimentary" : inr(order.shipping)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-border pt-2 font-medium text-[14px]">
                            <span>Total Paid / Due</span>
                            <span>{inr(order.total)}</span>
                          </div>
                          <p className="text-[11.5px] text-muted-foreground pt-1">
                            Payment: {order.paymentMethod === "Razorpay" ? "Paid Online" : order.paymentMethod} ({order.paymentStatus})
                          </p>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="border-t border-border pt-4 text-[12px] text-muted-foreground">
                        <span className="font-medium text-foreground">Notes: </span>
                        {order.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
