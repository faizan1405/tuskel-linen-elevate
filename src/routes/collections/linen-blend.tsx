import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHeader } from "@/components/site/PageHeader";
import { ShopView } from "@/components/site/ShopView";
import { Reveal } from "@/components/site/Reveal";
import hero from "@/assets/collection-linen-blend.jpg";

export const Route = createFileRoute("/collections/linen-blend")({
  head: () => ({
    meta: [
      { title: "Linen Blend Shirts for Men — Tuskel" },
      { name: "description", content: "Tuskel linen blend shirts balance the coolness of linen with the softness and easy care of cotton." },
      { property: "og:title", content: "Linen Blend Shirts for Men — Tuskel" },
      { property: "og:description", content: "Everyday softness with effortless structure. Shop the linen blend collection." },
      { property: "og:url", content: "/collections/linen-blend" },
    ],
    links: [{ rel: "canonical", href: "/collections/linen-blend" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Collections", to: "/shop" }, { label: "Linen Blend" }]} />
      <div className="grid items-end gap-10 pb-14 lg:grid-cols-2 lg:gap-16">
        <PageHeader
          eyebrow="Collection"
          title="Linen Blend"
          intro="Linen brings the coolness; cotton brings the softness and a smoother finish. The result creases less, presses easily and suits the days that run from a morning meeting into an evening out."
        />
        <Reveal>
          <div className="aspect-4/3 overflow-hidden bg-secondary">
            <img src={hero} alt="Man wearing a classic white linen blend shirt" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </div>
      <ShopView scope="linen-blend" showFabricFilter={false} />
    </div>
  );
}
