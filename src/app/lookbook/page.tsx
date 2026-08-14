import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function LookbookPage() {
  const looks = [
    { title: "Office Day", desc: "Crisp linen with tailored trousers.", slug: "classic-white-linen-blend-shirt" },
    { title: "Smart Casual", desc: "Relaxed layers for the weekend.", slug: "soft-cream-linen-blend-shirt" },
    { title: "Summer Evening", desc: "Colour that catches the golden hour.", slug: "vanilla-cream-pure-linen-shirt" },
    { title: "Weekend Travel", desc: "Lightweight and wrinkle-friendly.", slug: "aqua-mist-pure-linen-shirt" },
  ];

  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Style Guide</p>
          <h1 className="font-display text-4xl font-light md:text-5xl lg:text-6xl">Lookbook</h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground max-w-2xl">
            Four ways to wear Tuskel — from boardroom to beach. Each look pairs our shirts with understated essentials.
          </p>
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {looks.map((look) => (
            <Link key={look.slug} href={`/product/${look.slug}`} className="group block">
              <div className="aspect-[4/5] bg-secondary overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-muted/50 to-secondary flex items-center justify-center">
                  <span className="font-display text-2xl text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">{look.title}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-xl font-light group-hover:underline underline-offset-4">{look.title}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">{look.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
