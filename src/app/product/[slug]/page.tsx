"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductGrid } from "@/components/site/ProductGrid";
import { SizeGuideModal } from "@/components/site/SizeGuideModal";
import { SectionHeading } from "@/components/site/PageHeader";
import { inr, discountPercent } from "@/lib/format";
import { useStore } from "@/lib/store";
import { SIZES, type Size } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Minimal product type for the page
interface PageProduct {
  id: string;
  slug: string;
  name: string;
  fabric: string;
  fabricLabel: string;
  colorName: string;
  colorSlug: string;
  swatch: string;
  mrp: number;
  price: number;
  images: string[];
  sizes: string[];
  summary: string;
  details: string[];
  care: string[];
  fit: string;
  modelNote: string;
  newArrival: boolean;
  bestSeller: boolean;
  popularity: number;
  addedOn: string;
  _stock: number;
  _status: string;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = use(params);
  const slug = resolved.slug;
  const [product, setProduct] = useState<PageProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { addToCart, setCartOpen, toggleWishlist, isWishlisted, hydrated, markViewed, recentlyViewed } = useStore();
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pin, setPin] = useState("");
  const [pinResult, setPinResult] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setProduct(null);
    setSize(null);
    setActive(0);
    setQty(1);
    setPinResult(null);

    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Not found");
        const data = await r.json();
        return data.product;
      })
      .then((p) => {
        if (cancelled) return;
        if (!p) { setError(true); return; }
        setProduct(p);
        if (hydrated && !recentlyViewed.includes(p.slug)) markViewed(p.slug);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="shell pb-24 py-20">
        <div className="animate-pulse space-y-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="aspect-4/5 w-full bg-secondary" />
            <div className="space-y-4">
              <div className="h-4 w-24 bg-secondary" />
              <div className="h-8 w-3/4 bg-secondary" />
              <div className="h-6 w-32 bg-secondary" />
              <div className="h-4 w-full bg-secondary" />
              <div className="h-4 w-2/3 bg-secondary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="shell pb-24 py-20 text-center">
        <h1 className="font-display text-4xl font-light">Product not found</h1>
        <p className="mt-4 text-muted-foreground">This product doesn&apos;t exist or has been removed.</p>
        <Link href="/shop" className="mt-8 inline-block min-h-12 border border-foreground px-10 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-foreground hover:text-primary-foreground">
          Browse the Shop
        </Link>
      </div>
    );
  }

  const off = discountPercent(product.mrp, product.price);
  const wished = hydrated && isWishlisted(product.slug);
  const recent = recentlyViewed.filter((s) => s !== product.slug).map((s) => {
    // Use local static products for related/recent
    const { products } = require("@/lib/products");
    return products.find((p: any) => p.slug === s);
  }).filter(Boolean);

  function add(then?: "checkout") {
    if (!product || !size) { if (!size) setSizeError(true); return; }
    addToCart(product.slug, size, qty);
    setSizeError(false);
    if (then === "checkout") { window.location.href = "/checkout"; return; }
    setCartOpen(true);
    toast.success(`${product.colorName} added — size ${size}`);
  }

  return (
    <div className="pb-24">
      <div className="shell">
        <Breadcrumbs items={[{ label: "Shop", to: "/shop" }, { label: product.fabricLabel, to: product.fabric === "pure-linen" ? "/collections/pure-linen" : "/collections/linen-blend" }, { label: product.colorName }]} />

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <div className="grid gap-3 md:grid-cols-[76px_1fr]">
              <div className="order-2 flex gap-3 overflow-x-auto hide-scrollbar md:order-1 md:flex-col md:overflow-visible">
                {product.images.map((img: string, i: number) => (
                  <button key={i} type="button" onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
                    className={cn("aspect-4/5 w-16 shrink-0 overflow-hidden border md:w-full", active === i ? "border-foreground" : "border-transparent")}>
                    <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setZoom(true)} className="order-1 block aspect-4/5 w-full cursor-zoom-in overflow-hidden bg-secondary md:order-2" aria-label="Open full screen image viewer">
                <img src={product.images[active] || product.images[0]} alt={`${product.name}, view ${active + 1}`} width={1024} height={1280} className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.06]" />
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:h-fit">
            <p className="eyebrow">{product.fabricLabel}</p>
            <h1 className="mt-3 font-display text-3xl leading-tight font-light md:text-4xl">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-xl font-medium">{inr(product.price)}</span>
              <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
              {off > 0 && <span className="text-[12px] tracking-[0.12em] text-[oklch(0.5_0.09_40)] uppercase">{off}% off</span>}
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">Inclusive of all taxes</p>
            <p className="mt-6 text-[14.5px] leading-relaxed text-muted-foreground">{product.summary}</p>

            <div className="mt-8">
              <p className="text-[12px]"><span className="text-muted-foreground">Colour:</span> {product.colorName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colorSlug && (
                  <div className="h-8 w-8 rounded-full border border-foreground ring-1 ring-foreground ring-offset-2"
                    style={{ backgroundColor: product.swatch }} title={product.colorName} />
                )}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-[12px]"><span className="text-muted-foreground">Size:</span> {size ?? "Select a size"}</p>
                <SizeGuideModal trigger={<button type="button" className="text-[11px] tracking-[0.14em] uppercase underline underline-offset-4">Size Guide</button>} />
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {(product.sizes && product.sizes.length > 0 ? product.sizes : SIZES).map((s: string) => (
                  <button key={s} type="button" onClick={() => { setSize(s as Size); setSizeError(false); }} aria-pressed={size === s}
                    className={cn("min-h-11 border text-[12px] transition-colors", size === s ? "border-foreground bg-foreground text-primary-foreground" : "border-border hover:border-foreground")}>
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && <p role="alert" className="mt-2 text-[12px] text-destructive">Please choose a size to continue.</p>}
              {product.fit && <p className="mt-3 text-[12.5px] text-muted-foreground">{product.fit}</p>}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-border">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-8 text-center text-[13px]">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} className="flex h-11 w-11 items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <button type="button" onClick={() => { toggleWishlist(product.slug); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
                className="flex h-11 items-center gap-2 border border-border px-4 text-[11px] tracking-[0.14em] uppercase">
                <Heart className={cn("h-4 w-4", wished && "fill-current")} /> {wished ? "Saved" : "Wishlist"}
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <button type="button" onClick={() => { add(); }} disabled={!size}
                className="min-h-12 bg-foreground text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40">
                Add to Bag
              </button>
              <button type="button" onClick={() => { add("checkout"); }} disabled={!size}
                className="min-h-12 border border-foreground text-[11px] font-medium tracking-[0.18em] uppercase transition-colors hover:bg-foreground hover:text-primary-foreground disabled:opacity-40">
                Buy Now
              </button>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <label htmlFor="pin" className="text-[12px] text-muted-foreground">Check delivery by postcode</label>
              <div className="mt-2 flex gap-2">
                <input id="pin" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="110053" className="min-h-11 flex-1 border-b border-border bg-transparent px-1 text-[14px] focus:border-foreground focus:outline-none" />
                <button type="button" onClick={() => setPinResult(pin.length === 6 ? `Estimated delivery in 3–6 working days to ${pin}. Free shipping.` : "Enter a valid 6-digit postcode.")}
                  className="min-h-11 border border-border px-5 text-[11px] tracking-[0.14em] uppercase">Check</button>
              </div>
              {pinResult && <p role="status" className="mt-2 text-[12.5px] text-muted-foreground">{pinResult}</p>}
            </div>

            <ul className="mt-6 grid gap-2.5 text-[12.5px] text-muted-foreground">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Free shipping across India</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-accent" /> Easy 7-day returns and exchanges</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Secure checkout</li>
            </ul>

            <Accordion type="single" collapsible className="mt-8 border-t border-border">
              <AccordionItem value="details"><AccordionTrigger className="text-[13px]">Product details</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-muted-foreground">
                    {(product.details && product.details.length > 0 ? product.details : []).map((d: string) => <li key={d}>{d}</li>)}
                  </ul>
                </AccordionContent></AccordionItem>
              <AccordionItem value="care"><AccordionTrigger className="text-[13px]">Fabric and care</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] text-muted-foreground">
                    {(product.care && product.care.length > 0 ? product.care : []).map((d: string) => <li key={d}>{d}</li>)}
                  </ul>
                </AccordionContent></AccordionItem>
              <AccordionItem value="ship"><AccordionTrigger className="text-[13px]">Shipping and returns</AccordionTrigger>
                <AccordionContent>
                  <p className="text-[13.5px] text-muted-foreground">Orders are dispatched from Delhi within 1–2 working days and delivered free across India. Unworn items can be returned or exchanged within 7 days of delivery.</p>
                </AccordionContent></AccordionItem>
              <AccordionItem value="model"><AccordionTrigger className="text-[13px]">Fit and model</AccordionTrigger>
                <AccordionContent>
                  <p className="text-[13.5px] text-muted-foreground">{product.modelNote || "Model measurements coming soon."}</p>
                </AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </div>

        <section className="pt-24"><SectionHeading eyebrow="Complete the Look" title="Wears well with" className="mb-10" />
          <RelatedProducts product={product} />
        </section>
        {recent.length > 0 && (
          <section className="pt-24"><SectionHeading eyebrow="Recently Viewed" title="Back to what you saw" className="mb-10" />
            <ProductGrid products={recent} />
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium">{product.colorName}</p>
          <p className="text-[12px] text-muted-foreground">{inr(product.price)}{size ? ` · ${size}` : ""}</p>
        </div>
        <button type="button" onClick={() => { add(); }} disabled={!size}
          className="min-h-12 bg-foreground px-6 text-[11px] font-medium tracking-[0.16em] text-primary-foreground uppercase disabled:opacity-40">
          {size ? "Add to Bag" : "Select size"}
        </button>
      </div>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">{product.name} enlarged</DialogTitle>
          <img src={product.images[active] || product.images[0]} alt={product.name} className="h-auto w-full object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RelatedProducts({ product }: { product: PageProduct }) {
  const { products: staticProducts } = require("@/lib/products");
  const related = staticProducts
    .filter((p: any) => p.slug !== product.slug && p.fabric === product.fabric)
    .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 4);
  return <ProductGrid products={related} />;
}
