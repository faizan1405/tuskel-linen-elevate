"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Leaf, Wind, Truck, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/PageHeader";
import { ProductGrid } from "@/components/site/ProductGrid";
import { bestSellers, colours } from "@/lib/products";
import collectionPure from "@/assets/collection-pure-linen.jpg";
import collectionBlend from "@/assets/collection-linen-blend.jpg";
import campaign from "@/assets/campaign-summer.jpg";
import weave from "@/assets/detail-weave.jpg";
import collar from "@/assets/detail-collar.jpg";
import cuff from "@/assets/detail-cuff.jpg";
import lookOffice from "@/assets/look-office.jpg";
import lookSmart from "@/assets/look-smart-casual.jpg";
import lookWeekend from "@/assets/look-weekend.jpg";
import lookTravel from "@/assets/look-travel.jpg";
import lookEvening from "@/assets/look-evening.jpg";

const benefits = [
  { icon: Leaf, title: "Premium Linen Fabrics", copy: "Pure linen and linen-blend weaves chosen for hand and drape." },
  { icon: Wind, title: "Breathable All-Day Comfort", copy: "An open weave that keeps air moving through a warm day." },
  { icon: Truck, title: "Free Shipping Across India", copy: "Dispatched from Delhi, delivered nationwide at no cost." },
  { icon: RotateCcw, title: "Easy 7-Day Returns", copy: "Changed your mind? Return within seven days of delivery." },
];

export function BenefitsStrip() {
  return (
    <section className="border-y border-border">
      <div className="shell grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {benefits.map((b, i) => (
          <Reveal
            key={b.title}
            delay={i * 0.07}
            className="flex gap-4 py-8 sm:px-6 lg:border-r lg:border-border lg:last:border-r-0 lg:first:pl-0"
          >
            <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.4} aria-hidden="true" />
            <div>
              <h3 className="font-sans text-[13px] font-medium tracking-[0.04em]">{b.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{b.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CollectionCards() {
  const cards = [
    {
      title: "Pure Linen",
      line: "Natural breathability. Timeless refinement.",
      image: collectionPure.src,
      to: "/collections/pure-linen" as const,
      alt: "Man in a vanilla cream pure linen shirt against a limewashed wall",
    },
    {
      title: "Linen Blend",
      line: "Everyday softness with effortless structure.",
      image: collectionBlend.src,
      to: "/collections/linen-blend" as const,
      alt: "Man in a classic white linen blend shirt seated in a sunlit interior",
    },
  ];

  return (
    <section className="shell py-20 md:py-28">
      <SectionHeading eyebrow="Collections" title="Two weaves, one wardrobe" className="mb-12" />
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.1}>
            <Link href={c.to} className="group block">
              <div className="relative aspect-4/5 overflow-hidden bg-secondary md:aspect-3/4">
                <img
                  src={c.image}
                  alt={c.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.006_60/0.55)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-[oklch(0.977_0.006_85)] md:p-9">
                  <h3 className="font-display text-3xl font-light md:text-4xl">{c.title}</h3>
                  <p className="mt-2 max-w-xs text-[13.5px] opacity-90">{c.line}</p>
                  <span className="mt-5 inline-block border-b border-current pb-1 text-[11px] font-medium tracking-[0.18em] uppercase">
                    Shop {c.title}
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function BestSellersSection() {
  return (
    <section className="shell py-4 pb-20 md:pb-28">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Best Sellers" title="The shirts worn most" />
        <Reveal>
          <Link href="/shop"
            className="link-underline text-[11px] font-medium tracking-[0.18em] uppercase"
          >
            View all
          </Link>
        </Reveal>
      </div>
      <ProductGrid products={bestSellers().slice(0, 4)} />
    </section>
  );
}

const storyPoints = [
  { title: "Breathability", copy: "Linen's hollow fibre and open weave let warm air pass instead of trapping it." },
  { title: "Lightweight comfort", copy: "Less cloth against the skin, so a full day in the sun stays wearable." },
  { title: "Natural texture", copy: "Slubs and small irregularities are part of the yarn, not a flaw in it." },
  { title: "Moisture management", copy: "Linen absorbs moisture readily and releases it quickly into the air." },
  { title: "Timeless appeal", copy: "A fabric that has dressed warm climates for centuries, and still reads modern." },
];

export function LinenStorySection() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal>
            <p className="eyebrow mb-3">The Linen Story</p>
            <h2 className="text-3xl leading-[1.1] md:text-4xl lg:text-[2.9rem]">
              Designed by nature for warmer living.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Linen is spun from flax — a long, hollow fibre that moves air and moisture rather
              than holding them. It is why the fabric has always belonged to hot places.
            </p>
            <div className="mt-8 aspect-16/11 overflow-hidden">
              <img
                src={weave.src}
                alt="Macro view of a natural linen weave with visible slubs"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <Link href="/linen-story"
              className="mt-7 inline-block border-b border-foreground pb-1 text-[11px] font-medium tracking-[0.18em] uppercase"
            >
              Read the linen story
            </Link>
          </Reveal>
        </div>

        <ol className="divide-y divide-border">
          {storyPoints.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.05} className="py-8 first:pt-0">
              <div className="flex gap-6">
                <span className="font-display text-2xl leading-none text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-sans text-[14px] font-medium">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{p.copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CampaignSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section ref={ref} className="relative h-[80svh] min-h-[480px] overflow-hidden">
      <motion.img
        src={campaign.src}
        alt="Two men in powder blue and cream linen shirts walking through a sunlit colonnade"
        style={{ y }}
        loading="lazy"
        className="absolute inset-0 h-[112%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-[oklch(0.22_0.006_60/0.38)]" />
      <div className="shell relative flex h-full items-center">
        <Reveal className="max-w-lg text-[oklch(0.977_0.006_85)]">
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase opacity-85">
            Summer Formal
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] font-light md:text-5xl lg:text-[3.5rem]">
            Stay Cool. Look Sharp.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed opacity-90">
            A refined collection of breathable shirts created for boardrooms, celebrations, travel
            and everyday summer dressing.
          </p>
          <Link href="/shop"
            className="mt-8 inline-block min-h-12 bg-[oklch(0.977_0.006_85)] px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] text-foreground uppercase transition-opacity hover:opacity-85"
          >
            Explore the Collection
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function ShopByColour() {
  return (
    <section className="shell py-20 md:py-28">
      <SectionHeading
        eyebrow="Shop by Colour"
        title="Start with the shade"
        intro="Nine colours across pure linen and linen blend. Pick one and see what it comes in."
        className="mb-12"
      />
      <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-5 lg:grid-cols-9">
        {colours.map((c, i) => (
          <Reveal as="li" key={c.slug} delay={Math.min(i, 6) * 0.04}>
            <Link href="/shop"  className="group block text-center">
              <span
                className="mx-auto block aspect-square w-full max-w-16 rounded-full border border-border transition-transform duration-500 group-hover:scale-[1.07]"
                style={{ backgroundColor: c.hex }}
                aria-hidden="true"
              />
              <span className="mt-3 block text-[11.5px] tracking-[0.06em] text-muted-foreground group-hover:text-foreground">
                {c.name}
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function CraftSection() {
  const items = [
    { image: collar.src, alt: "Close-up of a linen shirt collar and top button", title: "The collar", copy: "Lightly fused so it holds its line without stiffness." },
    { image: cuff.src, alt: "Close-up of a linen shirt cuff with a mother of pearl button", title: "The cuff", copy: "Two-button adjustment, sized to sit clean under a watch." },
    { image: weave.src, alt: "Macro of the linen weave", title: "The weave", copy: "Open enough to breathe, dense enough to keep its shape." },
  ];
  return (
    <section className="shell pb-20 md:pb-28">
      <SectionHeading
        eyebrow="Craft"
        title="Considered in every detail."
        intro="Small decisions — collar structure, cuff width, stitch density — are what separate a linen shirt that lasts a season from one that lasts years."
        className="mb-12"
      />
      <div className="grid gap-5 sm:grid-cols-3 md:gap-6">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.08}>
            <div className="aspect-square overflow-hidden bg-secondary">
              <img
                src={it.image}
                alt={it.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[900ms] hover:scale-[1.04]"
              />
            </div>
            <h3 className="mt-4 font-sans text-[13px] font-medium">{it.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{it.copy}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function LookbookTeaser() {
  const looks = [
    { image: lookOffice.src, alt: "Man in a powder blue linen shirt in a modern office", label: "Work" },
    { image: lookWeekend.src, alt: "Man in an aqua mist linen shirt on a sunlit street", label: "Weekend" },
    { image: lookTravel.src, alt: "Man in a vanilla cream linen shirt carrying a travel bag", label: "Travel" },
    { image: lookEvening.src, alt: "Man in a midnight black linen shirt at dusk", label: "Evening" },
    { image: lookSmart.src, alt: "Man in a soft cream linen shirt in a sunlit cafe", label: "Celebrations" },
  ];
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="shell py-20 md:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Lookbook" title="Five ways to wear linen" />
          <Reveal>
            <Link href="/lookbook" className="link-underline text-[11px] font-medium tracking-[0.18em] uppercase">
              View the Lookbook
            </Link>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-5">
          {looks.map((l, i) => (
            <Reveal
              key={l.label}
              delay={i * 0.06}
              className={i === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-2"}
            >
              <Link href="/lookbook" className="group block">
                <div className={`overflow-hidden bg-secondary ${i === 0 ? "aspect-4/5 md:aspect-4/5" : "aspect-4/5"}`}>
                  <img
                    src={l.image}
                    alt={l.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                  />
                </div>
                <p className="mt-3 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {l.label}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** PROTOTYPE CONTENT — replace with verified customer reviews before launch. */
const reviews = [
  {
    name: "Arjun M.",
    product: "Classic White Linen Blend Shirt",
    quote: "Wore it through a full day of meetings in Chennai and it still looked composed by evening.",
  },
  {
    name: "Ritesh K.",
    product: "Vanilla Cream Pure Linen Shirt",
    quote: "The cream is warm rather than yellow. It sits well with both denim and formal trousers.",
  },
  {
    name: "Sahil D.",
    product: "Powder Blue Linen Blend Shirt",
    quote: "Softer than I expected from linen. The collar holds its shape without feeling stiff.",
  },
];

export function ReviewsSection() {
  return (
    <section className="shell py-20 md:py-28">
      <SectionHeading eyebrow="Customer Notes" title="In their words" className="mb-3" />
      <Reveal>
        <p className="mb-12 text-[12px] text-muted-foreground italic">
          Sample content for this prototype — replace with verified customer reviews.
        </p>
      </Reveal>
      <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.08} className="border-t border-border pt-7">
            <blockquote className="font-display text-xl leading-snug font-light">
              “{r.quote}”
            </blockquote>
            <footer className="mt-5 text-[12px] text-muted-foreground">
              <span className="text-foreground">{r.name}</span> · Verified buyer
              <span className="mt-0.5 block">{r.product}</span>
            </footer>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CommunityGallery() {
  const images = [
    { src: lookWeekend.src, alt: "Aqua mist linen shirt worn on a sunlit street" },
    { src: lookOffice.src, alt: "Powder blue linen shirt worn at work" },
    { src: cuff.src, alt: "Cuff detail of a cream linen shirt" },
    { src: lookTravel.src, alt: "Vanilla cream linen shirt worn while travelling" },
    { src: lookEvening.src, alt: "Midnight black linen shirt worn at dusk" },
    { src: lookSmart.src, alt: "Soft cream linen shirt worn in a cafe" },
  ];
  return (
    <section className="shell pb-20 md:pb-28">
      <SectionHeading eyebrow="Community" title="Worn the Tuskel Way" className="mb-10" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
        {images.map((img, i) => (
          <Reveal key={i} delay={Math.min(i, 5) * 0.05}>
            <div className="aspect-square overflow-hidden bg-secondary">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-700 hover:scale-[1.06] hover:brightness-[1.04]"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
