import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHeader } from "@/components/site/PageHeader";
import { ShopView } from "@/components/site/ShopView";
import { Reveal } from "@/components/site/Reveal";
import hero from "@/assets/look-evening.jpg";

export default function Page() {
  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Collections", to: "/shop" }, { label: "Ethnic Wear" }]} />
      <div className="grid items-end gap-10 pb-14 lg:grid-cols-2 lg:gap-16">
        <PageHeader
          eyebrow="Collection"
          title="Ethnic Wear"
          intro="Timeless traditional silhouettes tailored from pure and blended breathable fabrics. Designed for celebrations, festive occasions, and elevated everyday wear."
        />
        <Reveal>
          <div className="aspect-4/3 overflow-hidden bg-secondary">
            <img src={hero.src} alt="Ethnic Wear collection" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </div>
      <ShopView scope="ethnic-wear" showFabricFilter={false} useApi={true} />
    </div>
  );
}
