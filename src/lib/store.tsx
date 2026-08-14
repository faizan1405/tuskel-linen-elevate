"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "./products";
import type { Size } from "./site";
import { useSiteConfig } from "./site-config";

export interface CartLine {
  slug: string;
  size: Size;
  qty: number;
}

export interface WishlistEntry {
  slug: string;
}

interface StoreValue {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  cartOpen: boolean;
  coupon: string | null;
  hydrated: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (slug: string, size: Size, qty?: number) => void;
  updateQty: (slug: string, size: Size, qty: number) => void;
  removeLine: (slug: string, size: Size) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  markViewed: (slug: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  lines: Array<CartLine & { product: Product }>;
}

const StoreContext = createContext<StoreValue | null>(null);

const COUPONS: Record<string, { off: number; label: string }> = {
  TUSKEL10: { off: 0.1, label: "10% off your order" },
  SUMMER15: { off: 0.15, label: "15% summer sale discount" },
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<string | null>(null);

  useEffect(() => {
    setCart(read<CartLine[]>("tuskel.cart", []));
    setWishlist(read<string[]>("tuskel.wishlist", []));
    setRecentlyViewed(read<string[]>("tuskel.viewed", []));
    setCoupon(read<string | null>("tuskel.coupon", null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("tuskel.cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("tuskel.wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("tuskel.viewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("tuskel.coupon", JSON.stringify(coupon));
  }, [coupon, hydrated]);

  const value = useMemo<StoreValue>(() => {
    const lines = cart
      .map((line) => {
        const product = products.find((p) => p.slug === line.slug);
        return product ? { ...line, product } : null;
      })
      .filter(Boolean) as Array<CartLine & { product: Product }>;

    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
    const off = coupon ? (COUPONS[coupon]?.off ?? 0) : 0;
    const discount = Math.round(subtotal * off);
    const shipping = 0;
    const total = Math.max(0, subtotal - discount + shipping);

    return {
      cart,
      wishlist,
      recentlyViewed,
      cartOpen,
      coupon,
      hydrated,
      setCartOpen,
      addToCart: (slug, size, qty = 1) => {
        setCart((prev) => {
          const idx = prev.findIndex((l) => l.slug === slug && l.size === size);
          if (idx === -1) return [...prev, { slug, size, qty }];
          const next = [...prev];
          const current = next[idx]!;
          next[idx] = { ...current, qty: current.qty + qty };
          return next;
        });
      },
      updateQty: (slug, size, qty) =>
        setCart((prev) =>
          qty <= 0
            ? prev.filter((l) => !(l.slug === slug && l.size === size))
            : prev.map((l) => (l.slug === slug && l.size === size ? { ...l, qty } : l)),
        ),
      removeLine: (slug, size) =>
        setCart((prev) => prev.filter((l) => !(l.slug === slug && l.size === size))),
      clearCart: () => setCart([]),
      toggleWishlist: (slug) =>
        setWishlist((prev) =>
          prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
        ),
      isWishlisted: (slug) => wishlist.includes(slug),
      markViewed: (slug) =>
        setRecentlyViewed((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 8)),
      applyCoupon: (code) => {
        const key = code.trim().toUpperCase();
        if (!key) return { ok: false, message: "Enter a coupon code." };
        if (!COUPONS[key]) return { ok: false, message: "That code isn't valid." };
        setCoupon(key);
        return { ok: true, message: `Applied — ${COUPONS[key].label}.` };
      },
      removeCoupon: () => setCoupon(null),
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      subtotal,
      discount,
      shipping,
      total,
      lines,
    };
  }, [cart, wishlist, recentlyViewed, cartOpen, coupon, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
