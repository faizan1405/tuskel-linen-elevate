
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHeader } from "@/components/site/PageHeader";
import { ShopView } from "@/components/site/ShopView";
import { Reveal } from "@/components/site/Reveal";
import hero from "@/assets/collection-pure-linen.jpg";



export default function Page() {
  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Collections", to: "/shop" }, { label: "Pure Linen" }]} />
      <div className="grid items-end gap-10 pb-14 lg:grid-cols-2 lg:gap-16">
        <PageHeader
          eyebrow="Collection"
          title="Pure Linen"
          intro="Woven entirely from flax. The weave stays open, so air moves through it and the shirt keeps its cool even at the height of summer. Texture and soft creasing are part of the fabric's character, not a fault in it."
        />
        <Reveal>
          <div className="aspect-4/3 overflow-hidden bg-secondary">
            <img src={hero} alt="Man wearing a vanilla cream pure linen shirt" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </div>
      <ShopView scope="pure-linen" showFabricFilter={false} />
    </div>
  );
}
