import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductGrid } from "@/components/site/ProductGrid";
import { SectionHeading } from "@/components/site/PageHeader";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";
import { bestSellers } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Tuskel" },
      { name: "description", content: "Review the linen shirts in your Tuskel bag before checkout." },
      { property: "og:title", content: "Your Bag — Tuskel" },
      { property: "og:description", content: "Review your Tuskel order before checkout." },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: Page,
});

function Page() {
  const { lines, subtotal, discount, total, updateQty, removeLine, applyCoupon, removeCoupon, coupon } = useStore();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Bag" }]} />
      <h1 className="font-display text-4xl font-light md:text-5xl">Your Bag</h1>

      {lines.length === 0 ? (
        <div className="mt-12 border border-dashed border-border px-6 py-20 text-center">
          <p className="font-display text-2xl">Nothing here yet</p>
          <p className="mt-3 text-[13px] text-muted-foreground">Your bag is empty. The collection is a click away.</p>
          <Link to="/shop" className="mt-7 inline-block min-h-12 bg-foreground px-8 py-3.5 text-[11px] tracking-[0.18em] text-primary-foreground uppercase">Continue Shopping</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`} className="flex gap-4 py-6">
                <Link to="/product/$slug" params={{ slug: l.slug }} className="shrink-0">
                  <img src={l.product.images[0]} alt={l.product.name} loading="lazy" className="h-36 w-28 object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link to="/product/$slug" params={{ slug: l.slug }} className="text-[14px] font-medium link-underline">{l.product.name}</Link>
                      <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{l.product.fabricLabel} · Size {l.size}</p>
                    </div>
                    <button type="button" aria-label={`Remove ${l.product.name}`} onClick={() => removeLine(l.slug, l.size)} className="h-9 w-9 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-border">
                      <button type="button" aria-label="Decrease quantity" onClick={() => updateQty(l.slug, l.size, l.qty - 1)} className="flex h-10 w-10 items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-[13px]">{l.qty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => updateQty(l.slug, l.size, l.qty + 1)} className="flex h-10 w-10 items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="text-[14px] font-medium">{inr(l.product.price * l.qty)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <h2 className="eyebrow mb-4">Order Summary</h2>
            <div className="space-y-2.5 border-y border-border py-5 text-[14px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount ({coupon})</span><span>−{inr(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="flex justify-between border-t border-border pt-3 text-[15px] font-medium"><span>Estimated total</span><span>{inr(total)}</span></div>
            </div>

            <div className="mt-6">
              <label htmlFor="coupon" className="text-[12px] text-muted-foreground">Coupon code</label>
              <div className="mt-2 flex gap-2">
                <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="TUSKEL10"
                  className="min-h-11 flex-1 border-b border-border bg-transparent px-1 text-[14px] uppercase focus:border-foreground focus:outline-none" />
                <button type="button" onClick={() => { const r = applyCoupon(code); setMsg({ ok: r.ok, text: r.message }); }}
                  className="min-h-11 border border-border px-5 text-[11px] tracking-[0.14em] uppercase">Apply</button>
              </div>
              {msg && <p role="status" className={msg.ok ? "mt-2 text-[12px] text-accent" : "mt-2 text-[12px] text-destructive"}>{msg.text}</p>}
              {coupon && <button type="button" onClick={() => { removeCoupon(); setMsg(null); setCode(""); }} className="mt-2 text-[11px] uppercase underline">Remove coupon</button>}
            </div>

            <div className="mt-7 grid gap-2">
              <Link to="/checkout" className="flex min-h-12 items-center justify-center bg-foreground text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase">Proceed to Checkout</Link>
              <Link to="/shop" className="flex min-h-12 items-center justify-center border border-border text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-secondary">Continue Shopping</Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[12px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> Secure checkout · Easy 7-day returns</p>
          </aside>
        </div>
      )}

      <section className="pt-24"><SectionHeading eyebrow="You may also like" title="Recommended" className="mb-10" /><ProductGrid products={bestSellers().slice(0, 4)} /></section>
    </div>
  );
}
