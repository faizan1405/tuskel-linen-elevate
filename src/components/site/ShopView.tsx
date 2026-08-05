import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { colours, products as allProducts, type Fabric, type Product } from "@/lib/products";
import { SIZES } from "@/lib/site";
import { ProductGrid } from "./ProductGrid";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type SortKey = "newest" | "price-asc" | "price-desc" | "popularity";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "popularity", label: "Most popular" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

export interface ShopViewProps {
  scope?: Fabric | "all" | "new";
  initialColour?: string;
  initialSort?: SortKey;
  showFabricFilter?: boolean;
}

export function ShopView({
  scope = "all",
  initialColour,
  initialSort = "newest",
  showFabricFilter = true,
}: ShopViewProps) {
  const base = useMemo<Product[]>(() => {
    if (scope === "new") return allProducts.filter((p) => p.newArrival);
    if (scope === "all") return allProducts;
    return allProducts.filter((p) => p.fabric === scope);
  }, [scope]);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>(
    initialColour ? [initialColour] : [],
  );
  const [maxPrice, setMaxPrice] = useState(4000);
  const [visible, setVisible] = useState(8);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = base.filter((p) => {
      if (q && !`${p.name} ${p.colorName} ${p.fabricLabel}`.toLowerCase().includes(q)) return false;
      if (fabrics.length && !fabrics.includes(p.fabric)) return false;
      if (selectedColours.length && !selectedColours.includes(p.colorSlug)) return false;
      if (sizes.length && !sizes.some((s) => p.sizes.includes(s as never))) return false;
      if (p.price > maxPrice) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "popularity":
          return b.popularity - a.popularity;
        default:
          return b.addedOn.localeCompare(a.addedOn);
      }
    });
  }, [base, query, fabrics, selectedColours, sizes, maxPrice, sort]);

  const activeCount =
    fabrics.length + selectedColours.length + sizes.length + (maxPrice < 4000 ? 1 : 0);

  function clearAll() {
    setFabrics([]);
    setSizes([]);
    setSelectedColours([]);
    setMaxPrice(4000);
    setQuery("");
  }

  const filterPanel = (
    <FilterPanel
      showFabricFilter={showFabricFilter}
      fabrics={fabrics}
      setFabrics={setFabrics}
      sizes={sizes}
      setSizes={setSizes}
      selectedColours={selectedColours}
      setSelectedColours={setSelectedColours}
      maxPrice={maxPrice}
      setMaxPrice={setMaxPrice}
      onClear={clearAll}
      activeCount={activeCount}
    />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-28">{filterPanel}</div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <p className="text-[12px] tracking-[0.1em] text-muted-foreground uppercase">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>

          <div className="flex flex-1 items-center justify-end gap-2">
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="min-h-11 w-32 border-b border-border bg-transparent px-1 text-[13px] focus:border-foreground focus:outline-none sm:w-44"
            />
            <label htmlFor="shop-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-11 border-b border-border bg-transparent px-1 text-[13px] focus:border-foreground focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>

            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-2 border border-border px-3 text-[12px] tracking-[0.1em] uppercase lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters{activeCount > 0 && ` (${activeCount})`}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-6">
                <SheetTitle className="mb-6 font-display text-2xl font-light">Filters</SheetTitle>
                {filterPanel}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {[...fabrics, ...selectedColours, ...sizes].map((tag) => (
              <span
                key={tag}
                className="border border-border px-2.5 py-1 text-[11px] tracking-[0.1em] uppercase"
              >
                {tag.replace(/-/g, " ")}
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear all filters
            </button>
          </div>
        )}

        <div className="pt-10">
          {filtered.length === 0 ? (
            <div className="border border-dashed border-border px-6 py-20 text-center">
              <p className="font-display text-2xl">No shirts match these filters</p>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Try removing a colour or widening the price range.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 min-h-11 border border-border px-6 text-[11px] tracking-[0.18em] uppercase hover:bg-secondary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <ProductGrid products={filtered.slice(0, visible)} columns={3} />
              {filtered.length > visible && (
                <div className="mt-14 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + 8)}
                    className="min-h-12 border border-foreground px-10 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors hover:bg-foreground hover:text-primary-foreground"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel(props: {
  showFabricFilter: boolean;
  fabrics: Fabric[];
  setFabrics: (v: Fabric[]) => void;
  sizes: string[];
  setSizes: (v: string[]) => void;
  selectedColours: string[];
  setSelectedColours: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  onClear: () => void;
  activeCount: number;
}) {
  const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <div className="space-y-8">
      {props.showFabricFilter && (
        <fieldset>
          <legend className="eyebrow mb-3">Fabric</legend>
          <div className="space-y-2">
            {(
              [
                { key: "pure-linen", label: "Pure Linen" },
                { key: "linen-blend", label: "Linen Blend" },
              ] as const
            ).map((f) => (
              <label key={f.key} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[13px]">
                <input
                  type="checkbox"
                  checked={props.fabrics.includes(f.key)}
                  onChange={() => toggle(props.fabrics, f.key, props.setFabrics)}
                  className="h-3.5 w-3.5 accent-[oklch(0.505_0.045_115)]"
                />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="eyebrow mb-3">Colour</legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {colours.map((c) => {
            const active = props.selectedColours.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(props.selectedColours, c.slug, props.setSelectedColours)}
                className={cn(
                  "flex min-h-9 items-center gap-2 text-left text-[12px]",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full border",
                    active ? "border-foreground ring-1 ring-foreground ring-offset-2" : "border-border",
                  )}
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Size</legend>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const active = props.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(props.sizes, s, props.setSizes)}
                className={cn(
                  "min-h-10 min-w-11 border px-2 text-[12px]",
                  active ? "border-foreground bg-foreground text-primary-foreground" : "border-border",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Price</legend>
        <label htmlFor="price-range" className="sr-only">
          Maximum price
        </label>
        <input
          id="price-range"
          type="range"
          min={1500}
          max={4000}
          step={250}
          value={props.maxPrice}
          onChange={(e) => props.setMaxPrice(Number(e.target.value))}
          className="w-full accent-[oklch(0.505_0.045_115)]"
        />
        <p className="mt-2 text-[12px] text-muted-foreground">Up to ₹{props.maxPrice.toLocaleString("en-IN")}</p>
      </fieldset>

      {props.activeCount > 0 && (
        <button
          type="button"
          onClick={props.onClear}
          className="min-h-11 w-full border border-border text-[11px] tracking-[0.16em] uppercase hover:bg-secondary"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
