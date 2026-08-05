import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useStore } from "@/lib/store";
import { products } from "@/lib/products";
import { inr } from "@/lib/format";
import { SIZES, type Size } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Tuskel" },
      { name: "description", content: "The Tuskel linen shirts you have saved." },
      { property: "og:title", content: "Wishlist — Tuskel" },
      { property: "og:description", content: "The Tuskel linen shirts you have saved." },
      { property: "og:url", content: "/wishlist" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: Page,
});

function Page() {
  const { wishlist, toggleWishlist, addToCart, setCartOpen, hydrated } = useStore();
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const saved = products.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="font-display text-4xl font-light md:text-5xl">Wishlist</h1>

      {!hydrated ? (
        <div className="mt-12 h-40 animate-pulse bg-secondary" />
      ) : saved.length === 0 ? (
        <div className="mt-12 border border-dashed border-border px-6 py-20 text-center">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <p className="mt-3 text-[13px] text-muted-foreground">Tap the heart on any shirt to keep it here.</p>
          <Link to="/shop" className="mt-7 inline-block min-h-12 bg-foreground px-8 py-3.5 text-[11px] tracking-[0.18em] text-primary-foreground uppercase">Shop the collection</Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {saved.map((p) => (
            <li key={p.slug} className="flex flex-col gap-4 py-6 sm:flex-row">
              <Link to="/product/$slug" params={{ slug: p.slug }} className="shrink-0">
                <img src={p.images[0]} alt={p.name} loading="lazy" className="h-40 w-32 object-cover" />
              </Link>
              <div className="flex-1">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="text-[14px] font-medium link-underline">{p.name}</Link>
                    <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{p.fabricLabel}</p>
                    <p className="mt-2 text-[13px]">{inr(p.price)}</p>
                  </div>
                  <button type="button" aria-label={`Remove ${p.name} from wishlist`} onClick={() => toggleWishlist(p.slug)} className="h-9 w-9 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {SIZES.map((s) => (
                    <button key={s} type="button" onClick={() => setSizes((prev) => ({ ...prev, [p.slug]: s }))} aria-pressed={sizes[p.slug] === s}
                      className={cn("min-h-10 min-w-11 border text-[12px]", sizes[p.slug] === s ? "border-foreground bg-foreground text-primary-foreground" : "border-border")}>{s}</button>
                  ))}
                  <button type="button" disabled={!sizes[p.slug]}
                    onClick={() => { const s = sizes[p.slug]; if (!s) return; addToCart(p.slug, s); setCartOpen(true); toast.success("Added to bag"); }}
                    className="ml-auto min-h-11 bg-foreground px-6 text-[11px] tracking-[0.16em] text-primary-foreground uppercase disabled:opacity-40">Add to Bag</button>
                </div>
                {!sizes[p.slug] && <p className="mt-2 text-[12px] text-muted-foreground">Choose a size to add this to your bag.</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
