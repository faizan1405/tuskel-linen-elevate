import Link from "next/link";
import { ChevronRight } from "lucide-react";

const posts = [
  { title: "Why linen is the fabric of summer", date: "July 2026", href: "#" },
  { title: "Caring for your linen shirts", date: "June 2026", href: "#" },
  { title: "The colours of India, in linen", date: "May 2026", href: "#" },
  { title: "Building a capsule wardrobe with linen", date: "April 2026", href: "#" },
];

export default function JournalPage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Stories & Ideas</p>
          <h1 className="font-display text-4xl font-light md:text-5xl lg:text-6xl">Journal</h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground max-w-2xl">
            Thoughts on fabric, style, and the slow life — from the Tuskel team.
          </p>
        </div>
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.title} className="group">
              <div className="aspect-[16/9] bg-secondary" />
              <div className="mt-5">
                <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{post.date}</p>
                <h2 className="mt-2 font-display text-xl font-light group-hover:underline underline-offset-4">{post.title}</h2>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
