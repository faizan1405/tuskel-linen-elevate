"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import { inr, discountPercent } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/products";
import type { Size } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { toggleWishlist, isWishlisted, addToCart, setCartOpen, hydrated } = useStore();
  const [quickAdd, setQuickAdd] = useState(false);
  const off = discountPercent(product.mrp, product.price);
  const wished = hydrated && isWishlisted(product.slug);

  function choose(size: Size) {
    addToCart(product.slug, size, 1);
    setQuickAdd(false);
    setCartOpen(true);
    toast.success(`${product.colorName} added — size ${size}`);
  }

  return (
    <article className="group relative">
      <div className="relative overflow-hidden bg-secondary">
        <Link href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="block"
        >
          <div className="relative aspect-4/5 w-full">
            <img
              src={product.images[0]}
              alt={`${product.name} shown from the front`}
              width={1024}
              height={1280}
              loading={priority ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0"
            />
            <img
              src={product.images[1]}
              alt={`${product.name} styled on model`}
              width={1040}
              height={1300}
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            />
          </div>
        </Link>

        {off > 0 && (
          <span className="absolute top-3 left-3 bg-background/90 px-2 py-1 text-[10px] font-medium tracking-[0.16em] uppercase">
            {off}% Off
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            toggleWishlist(product.slug);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wished}
          className="absolute top-2 right-2 flex h-11 w-11 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
        >
          <Heart className={cn("h-[18px] w-[18px]", wished && "fill-current text-foreground")} />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden p-3 md:block">
          <AnimatePresence mode="wait" initial={false}>
            {quickAdd ? (
              <motion.div
                key="sizes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto flex items-center gap-1 bg-background/95 p-1.5 backdrop-blur"
              >
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => choose(size)}
                    className="flex-1 py-2 text-[11px] font-medium tracking-[0.1em] transition-colors hover:bg-foreground hover:text-primary-foreground"
                  >
                    {size}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Close size picker"
                  onClick={() => setQuickAdd(false)}
                  className="px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="quick"
                type="button"
                onClick={() => setQuickAdd(true)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full bg-background/95 py-2.5 text-[11px] font-medium tracking-[0.18em] uppercase opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
              >
                Quick Add
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-[13px] leading-snug font-medium">
              <Link href={`/product/${product.slug}`} className="link-underline">
                {product.name}
              </Link>
            </h3>
            <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              {product.fabricLabel}
            </p>
          </div>
          <span
            className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: product.swatch }}
            title={product.colorName}
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 flex items-baseline gap-2 text-[13px]">
          <span className="font-medium">{inr(product.price)}</span>
          <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
        </p>
        <div className="mt-3 md:hidden">
          <Link href={`/product/${product.slug}`}
            className="inline-flex min-h-11 items-center text-[11px] font-medium tracking-[0.18em] uppercase underline underline-offset-4"
          >
            Select size
          </Link>
        </div>
      </div>
    </article>
  );
}
