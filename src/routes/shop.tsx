import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHeader } from "@/components/site/PageHeader";
import { ShopView, type SortKey } from "@/components/site/ShopView";

type ShopSearch = { colour?: string; sort?: SortKey };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    ...(typeof search.colour === "string" ? { colour: search.colour } : {}),
    ...(typeof search.sort === "string" ? { sort: search.sort as SortKey } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Shop All Linen Shirts — Tuskel" },
      { name: "description", content: "Browse every Tuskel linen and linen-blend shirt. Filter by fabric, colour, size and price." },
      { property: "og:title", content: "Shop All Linen Shirts — Tuskel" },
      { property: "og:description", content: "Every Tuskel shirt in one place — pure linen and linen blend, sizes S to 3XL." },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { colour, sort } = Route.useSearch();
  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <PageHeader
        eyebrow="All Shirts"
        title="The full collection"
        intro="Pure linen and linen blend, cut to the same regular fit and available from S to 3XL."
      />
      <ShopView
        {...(colour ? { initialColour: colour } : {})}
        {...(sort ? { initialSort: sort } : {})}
      />
    </div>
  );
}
