
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



export default function Index() {
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
