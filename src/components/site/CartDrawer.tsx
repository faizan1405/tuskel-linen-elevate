import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, updateQty, removeLine, cartCount } = useStore();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetTitle className="border-b border-border px-6 py-5 font-display text-xl font-light">
          Your Bag {cartCount > 0 && <span className="text-muted-foreground">({cartCount})</span>}
        </SheetTitle>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="text-[13px] text-muted-foreground">
              Start with the shirts our customers return to most.
            </p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="mt-2 min-h-11 bg-foreground px-8 py-3 text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={`${line.slug}-${line.size}`} className="flex gap-4 py-5">
                  <Link
                    to="/product/$slug"
                    params={{ slug: line.slug }}
                    onClick={() => setCartOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={line.product.images[0]}
                      alt={line.product.name}
                      className="h-28 w-22 object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="text-[13px] font-medium">{line.product.name}</p>
                      <button
                        type="button"
                        aria-label={`Remove ${line.product.name} size ${line.size}`}
                        onClick={() => removeLine(line.slug, line.size)}
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                      {line.product.fabricLabel} · Size {line.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(line.slug, line.size, line.qty - 1)}
                          className="flex h-9 w-9 items-center justify-center"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-[13px]">{line.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(line.slug, line.size, line.qty + 1)}
                          className="flex h-9 w-9 items-center justify-center"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[13px] font-medium">{inr(line.product.price * line.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 py-5">
              <div className="flex justify-between text-[14px]">
                <span>Subtotal</span>
                <span className="font-medium">{inr(subtotal)}</span>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Shipping free across India. Taxes included.
              </p>
              <div className="mt-5 grid gap-2">
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="flex min-h-12 items-center justify-center bg-foreground text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase transition-opacity hover:opacity-85"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="flex min-h-12 items-center justify-center border border-border text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-secondary"
                >
                  View Bag
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
