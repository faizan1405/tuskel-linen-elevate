"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function OrderRow({ order }: { order: any }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs font-medium">{order.orderNo}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Placed on {order.placedOn}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          order.status === "delivered" ? "bg-green-100 text-green-700" :
          order.status === "cancelled" ? "bg-red-100 text-red-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {order.status}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {order.items?.map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>{item.name} <span className="text-muted-foreground">x{item.qty}</span></span>
            <span className="font-medium">Rs. {(item.price * item.qty).toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">Rs. {order.total?.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

function OrdersPageInner() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get("orderNo") || "";

  // Demo: show placeholder if no orders in DB yet
  const orders: any[] = [];

  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Account</p>
          <h1 className="font-display text-4xl font-light md:text-5xl">Your Orders</h1>
        </div>
        {orders.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-display text-2xl font-light">No orders yet</p>
            <p className="mt-3 text-muted-foreground">When you place an order, it will appear here.</p>
            <Link href="/shop" className="mt-8 inline-flex items-center gap-2 min-h-12 border border-foreground px-8 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-foreground hover:text-primary-foreground transition-colors">
              Start Shopping <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {orders.map((o) => <OrderRow key={o.orderNo} order={o} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="shell pb-24 py-20 text-center text-muted-foreground">Loading...</div>}>
      <OrdersPageInner />
    </Suspense>
  );
}
