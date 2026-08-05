"use client";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import type { Product } from "@/lib/products";

export function ProductGrid({
  products,
  columns = 4,
}: {
  products: Product[];
  columns?: 2 | 3 | 4;
}) {
  const cls =
    columns === 4
      ? "grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4"
      : columns === 3
        ? "grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6"
        : "grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6";

  return (
    <div className={cls}>
      {products.map((product, i) => (
        <Reveal key={product.slug} delay={Math.min(i, 4) * 0.06}>
          <ProductCard product={product} priority={i < 2} />
        </Reveal>
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-4/5 w-full bg-secondary" />
          <div className="mt-4 h-3 w-3/4 bg-secondary" />
          <div className="mt-2 h-3 w-1/3 bg-secondary" />
        </div>
      ))}
    </div>
  );
}
