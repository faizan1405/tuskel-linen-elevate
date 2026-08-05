import { createFileRoute } from "@tanstack/react-router";
import { HomeHero } from "@/components/home/HomeHero";
import {
  BenefitsStrip,
  BestSellersSection,
  CampaignSection,
  CollectionCards,
  CommunityGallery,
  CraftSection,
  LinenStorySection,
  LookbookTeaser,
  ReviewsSection,
  ShopByColour,
} from "@/components/home/HomeSections";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tuskel — Premium Men's Pure Linen & Linen Blend Shirts" },
      {
        name: "description",
        content:
          "Made for warmer days. Designed for sharper ones. Shop Tuskel premium linen shirts for men — breathable, refined and shipped free across India.",
      },
      { property: "og:title", content: "Tuskel — Premium Men's Linen Shirts" },
      {
        property: "og:description",
        content:
          "Premium linen shirts crafted for effortless comfort, refined style and modern living.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HomeHero />
      <BenefitsStrip />
      <CollectionCards />
      <BestSellersSection />
      <LinenStorySection />
      <CampaignSection />
      <ShopByColour />
      <CraftSection />
      <LookbookTeaser />
      <ReviewsSection />
      <CommunityGallery />
      <section className="border-t border-border py-20 md:py-24">
        <div className="shell">
          <Newsletter />
        </div>
      </section>
    </>
  );
}
