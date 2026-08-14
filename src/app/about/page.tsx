import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Our Story</p>
          <h1 className="font-display text-4xl font-light md:text-5xl lg:text-6xl">About Tuskel</h1>
          <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Tuskel is a menswear brand born in Delhi, built on the belief that great fabric is the foundation of great clothes. We make pure linen and linen-blend shirts designed for the way Indian men actually live — in warm weather, in busy cities, between occasions.
            </p>
            <p>
              Our name comes from the Turkish word for &ldquo;fibre&rdquo; — a nod to the global heritage of linen and the craftsmanship behind every thread. We partner with family-run mills in Portugal, Lithuania, and Gujarat to produce fabric that meets our exacting standards for hand feel, drape, and wash.
            </p>
            <p>
              Every Tuskel shirt is designed and tested in our Delhi studio. We obsess over the collar stand, the sleeve pitch, the curve of the hem — the details you feel more than you see. Because when the fabric is right, everything else follows.
            </p>
            <h2 className="font-display text-2xl font-light text-foreground pt-6">Our Values</h2>
            <ul className="space-y-3">
              <li><strong className="text-foreground">Honest materials.</strong> No synthetic finishes. No greenwashing. Just linen, cotton, and transparency.</li>
              <li><strong className="text-foreground">Quiet luxury.</strong> We don&apos;t do logos on the outside. The quality speaks for itself.</li>
              <li><strong className="text-foreground">Made to last.</strong> Linen gets better with age. We design for a wardrobe, not a season.</li>
              <li><strong className="text-foreground">Fair supply chains.</strong> We visit every mill. We know the people who make our fabric.</li>
            </ul>
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
