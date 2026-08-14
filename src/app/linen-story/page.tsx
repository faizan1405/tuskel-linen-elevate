import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function LinenStoryPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Our Heritage</p>
          <h1 className="font-display text-4xl font-light md:text-5xl lg:text-6xl">The Linen Story</h1>
          <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Linen is one of humanity&apos;s oldest textiles, woven from the flax plant for over 30,000 years. It is the first fibre nature intended for cloth — cool to the touch, remarkably strong, and impossibly elegant.
            </p>
            <p>
              Tuskel was born from a simple belief: that linen deserves a modern wardrobe. We work directly with heritage mills across Europe and India to source yarns that balance the raw texture of pure linen with the everyday comfort of a linen-cotton blend.
            </p>
            <p>
              Every Tuskel shirt is cut in a regular fit designed for the Indian climate — relaxed enough for afternoon heat, structured enough for evening occasions. Our colours are drawn from Indian landscapes: the mist over Yamuna, the pink of a summer sunset, the blue of a Delhi sky.
            </p>
            <h2 className="font-display text-2xl font-light text-foreground pt-6">From Flax to Fabric</h2>
            <p>
              The journey begins in the field. Flax is harvested, retted, and scutched — traditional methods that have changed little in centuries. The resulting long fibres are spun into yarn, then woven into cloth on modernised looms that respect the material&apos;s natural irregularity.
            </p>
            <p>
              We do not over-process our fabric. We do not add synthetic finishes to mask texture. What you feel when you wear Tuskel is linen, as it was meant to be.
            </p>
          </div>
          <div className="mt-12">
            <Link href="/shop" className="inline-flex items-center gap-2 min-h-12 border border-foreground px-8 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-foreground hover:text-primary-foreground transition-colors">
              Shop the Collection <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
