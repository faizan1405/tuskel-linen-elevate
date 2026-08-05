import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";
import { Newsletter } from "./Newsletter";

const shop = [
  { label: "Shop All", to: "/shop" },
  { label: "Pure Linen", to: "/collections/pure-linen" },
  { label: "Linen Blend", to: "/collections/linen-blend" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Best Sellers", to: "/shop" },
] as const;

const care = [
  { label: "Contact Us", to: "/contact" },
  { label: "Frequently Asked Questions", to: "/faq" },
  { label: "Size Guide", to: "/size-guide" },
  { label: "Shipping and Delivery", to: "/policies/shipping" },
  { label: "Returns and Exchanges", to: "/policies/returns" },
  { label: "Track Order", to: "/track-order" },
] as const;

const about = [
  { label: "Our Story", to: "/about" },
  { label: "The Linen Story", to: "/linen-story" },
  { label: "Lookbook", to: "/lookbook" },
  { label: "Journal", to: "/journal" },
] as const;

const legal = [
  { label: "Privacy Policy", to: "/policies/privacy" },
  { label: "Terms and Conditions", to: "/policies/terms" },
  { label: "Return and Refund Policy", to: "/policies/returns" },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-display text-2xl tracking-[0.32em]">TUSKEL</p>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              Premium linen and linen-blend shirts for warm days and sharp ones.
            </p>
            <div className="mt-8 hidden max-w-sm lg:block">
              <p className="eyebrow">A more refined inbox</p>
              <Newsletter variant="footer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            <FooterCol title="Shop" links={shop} />
            <FooterCol title="Customer Care" links={care} />
            <FooterCol title="About" links={about} />
            <div>
              <h3 className="eyebrow mb-4">Contact</h3>
              <ul className="space-y-2.5 text-[13px] text-muted-foreground">
                <li>
                  <a href={`tel:+91${site.phone}`} className="link-underline">
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="link-underline">
                    {site.email}
                  </a>
                  {site.emailIsPlaceholder && (
                    <span className="block text-[11px] text-muted-foreground/70">
                      Placeholder — pending confirmation
                    </span>
                  )}
                </li>
                <li className="leading-relaxed">
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </li>
              </ul>
              <h3 className="eyebrow mt-8 mb-3">Follow</h3>
              <div className="flex gap-3">
                <a href="https://instagram.com" aria-label="Tuskel on Instagram" className="p-1">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://facebook.com" aria-label="Tuskel on Facebook" className="p-1">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://twitter.com" aria-label="Tuskel on X" className="p-1">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 lg:hidden">
          <p className="eyebrow">A more refined inbox</p>
          <Newsletter variant="footer" />
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Secure checkout</span>
            <span aria-hidden="true">·</span>
            <span>UPI</span>
            <span aria-hidden="true">·</span>
            <span>Visa</span>
            <span aria-hidden="true">·</span>
            <span>Mastercard</span>
            <span aria-hidden="true">·</span>
            <span>RuPay</span>
            <span aria-hidden="true">·</span>
            <span>Net Banking</span>
            <span aria-hidden="true">·</span>
            <span>Cash on Delivery</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            {legal.map((l) => (
              <Link key={l.label} to={l.to} className="link-underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-6 text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Tuskel. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; to: string }[];
}) {
  return (
    <div>
      <h3 className="eyebrow mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="link-underline text-[13px] text-muted-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
