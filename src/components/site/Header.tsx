import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { colours, products } from "@/lib/products";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { inr } from "@/lib/format";
import { LoginModal } from "@/components/site/LoginModal";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop", mega: true },
  { label: "Pure Linen", to: "/collections/pure-linen" },
  { label: "Linen Blend", to: "/collections/linen-blend" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "The Linen Story", to: "/linen-story" },
  { label: "Lookbook", to: "/lookbook" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

const MEGA = [
  { label: "Shop All", to: "/shop" },
  { label: "Pure Linen Shirts", to: "/collections/pure-linen" },
  { label: "Linen Blend Shirts", to: "/collections/linen-blend" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Best Sellers", to: "/shop", search: { sort: "popularity" } as const },
  { label: "Size Guide", to: "/size-guide" },
] as const;

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { cartCount, wishlist, setCartOpen, hydrated } = useStore();
  const { user, hydrated: authHydrated } = useAuth();

  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const solid = !overHero || scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-500",
        solid ? "border-b border-border bg-background/95 backdrop-blur" : "bg-transparent",
      )}
      onMouseLeave={() => setMegaOpen(false)}
    >
      <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[74px]">
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="flex h-11 w-11 items-center justify-center -ml-2"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <MobileNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        <Link
          to="/"
          className="font-display text-[22px] leading-none tracking-[0.34em] lg:text-[26px]"
          aria-label="Tuskel home"
        >
          TUSKEL
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-7">
            {NAV.map((item) => (
              <li
                key={item.label}
                onMouseEnter={() => setMegaOpen("mega" in item ? Boolean(item.mega) : false)}
              >
                <Link
                  to={item.to}
                  className="flex items-center gap-1 py-2 text-[11px] font-medium tracking-[0.15em] uppercase"
                  activeProps={{ className: "text-foreground" }}
                  inactiveProps={{ className: "text-foreground/75 hover:text-foreground" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                  {"mega" in item && item.mega && (
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-11 items-center justify-center"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          {authHydrated && user ? (
            <Link
              to="/account"
              aria-label={`Account, signed in as ${user.name}`}
              className="hidden h-11 w-11 items-center justify-center sm:flex"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-full object-cover border border-border"
                />
              ) : (
                <User className="h-[18px] w-[18px]" />
              )}
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Sign in"
              onClick={() => setLoginOpen(true)}
              className="hidden h-11 w-11 items-center justify-center sm:flex"
            >
              <User className="h-[18px] w-[18px]" />
            </button>
          )}
          <Link
            to="/wishlist"
            aria-label={`Wishlist${hydrated && wishlist.length ? `, ${wishlist.length} saved` : ""}`}
            className="relative flex h-11 w-11 items-center justify-center"
          >
            <Heart className="h-[18px] w-[18px]" />
            {hydrated && wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Cart${hydrated && cartCount ? `, ${cartCount} items` : ", empty"}`}
            className="relative flex h-11 w-11 items-center justify-center"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {hydrated && cartCount > 0 && (
              <span className="absolute top-1 right-0.5 min-w-4 rounded-full bg-foreground px-1 text-[9px] leading-4 font-medium text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full hidden border-y border-border bg-background lg:block"
          >
            <div className="shell grid grid-cols-12 gap-10 py-10">
              <div className="col-span-3">
                <p className="eyebrow mb-4">Collections</p>
                <ul className="space-y-2.5">
                  {MEGA.map((m) => (
                    <li key={m.label}>
                      <Link
                        to={m.to}
                        search={"search" in m ? (m.search as never) : undefined}
                        className="link-underline text-[14px]"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-4">
                <p className="eyebrow mb-4">Shop by Colour</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {colours.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/shop"
                        search={{ colour: c.slug }}
                        className="group flex items-center gap-2.5 text-[13px]"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-border"
                          style={{ backgroundColor: c.hex }}
                          aria-hidden="true"
                        />
                        <span className="link-underline">{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-5 grid grid-cols-2 gap-5">
                {products.slice(0, 2).map((p) => (
                  <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} className="group">
                    <div className="aspect-4/5 overflow-hidden bg-secondary">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="mt-3 text-[12px] font-medium">{p.name}</p>
                    <p className="text-[12px] text-muted-foreground">{inr(p.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>("Shop");
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="font-display text-lg tracking-[0.3em]">TUSKEL</span>
      </div>
      <nav aria-label="Mobile" className="flex-1 px-5 py-4">
        <ul className="divide-y divide-border">
          <li>
            <Link to="/" onClick={onNavigate} className="block py-3.5 text-[14px]">
              Home
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setOpenGroup(openGroup === "Shop" ? null : "Shop")}
              aria-expanded={openGroup === "Shop"}
              className="flex w-full items-center justify-between py-3.5 text-left text-[14px]"
            >
              Shop
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", openGroup === "Shop" && "rotate-180")}
              />
            </button>
            <AnimatePresence initial={false}>
              {openGroup === "Shop" && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden pb-2"
                >
                  {MEGA.map((m) => (
                    <li key={m.label}>
                      <Link
                        to={m.to}
                        search={"search" in m ? (m.search as never) : undefined}
                        onClick={onNavigate}
                        className="block py-2.5 pl-4 text-[13px] text-muted-foreground"
                      >
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setOpenGroup(openGroup === "Colour" ? null : "Colour")}
              aria-expanded={openGroup === "Colour"}
              className="flex w-full items-center justify-between py-3.5 text-left text-[14px]"
            >
              Shop by Colour
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", openGroup === "Colour" && "rotate-180")}
              />
            </button>
            <AnimatePresence initial={false}>
              {openGroup === "Colour" && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden pb-2"
                >
                  {colours.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/shop"
                        search={{ colour: c.slug }}
                        onClick={onNavigate}
                        className="flex items-center gap-2.5 py-2.5 pl-4 text-[13px] text-muted-foreground"
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
          {NAV.filter((n) => !["Home", "Shop"].includes(n.label)).map((item) => (
            <li key={item.label}>
              <Link to={item.to} onClick={onNavigate} className="block py-3.5 text-[14px]">
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/journal" onClick={onNavigate} className="block py-3.5 text-[14px]">
              Journal
            </Link>
          </li>
        </ul>
      </nav>
      <div className="border-t border-border px-5 py-4">
        <div className="flex gap-4 text-[12px] tracking-[0.12em] uppercase">
          <Link to="/account" onClick={onNavigate}>Account</Link>
          <Link to="/wishlist" onClick={onNavigate}>Wishlist</Link>
          <Link to="/track-order" onClick={onNavigate}>Track Order</Link>
        </div>
      </div>
    </div>
  );
}

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.colorName.toLowerCase().includes(q) ||
          p.fabricLabel.toLowerCase().includes(q),
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-24 max-w-2xl translate-y-0 p-0">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="border-b border-border px-5">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shirts, colours, fabrics…"
            aria-label="Search products"
            className="min-h-14 w-full bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-3">
          {q && results.length === 0 && (
            <p className="px-2 py-8 text-center text-[13px] text-muted-foreground">
              Nothing matched “{query}”. Try a colour such as cream or blue.
            </p>
          )}
          {!q && (
            <p className="px-2 py-8 text-center text-[13px] text-muted-foreground">
              Start typing to search the collection.
            </p>
          )}
          <ul>
            {results.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-4 px-2 py-2.5 hover:bg-secondary"
                >
                  <img src={p.images[0]} alt="" className="h-16 w-13 object-cover" loading="lazy" />
                  <span className="flex-1 text-[13px]">{p.name}</span>
                  <span className="text-[13px] text-muted-foreground">{inr(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
