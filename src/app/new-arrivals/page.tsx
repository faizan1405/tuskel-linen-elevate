
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ShopView } from "@/components/site/ShopView";
import { Reveal } from "@/components/site/Reveal";
import campaign from "@/assets/campaign-summer.jpg";



export default function Page() {
  return (
    <div className="pb-24">
      <Reveal>
        <div className="relative h-[46svh] min-h-[320px] overflow-hidden">
          <img src={campaign.src} alt="Summer 2026 campaign imagery" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[oklch(0.22_0.006_60/0.35)]" />
          <div className="shell absolute inset-0 flex flex-col justify-center text-[oklch(0.977_0.006_85)]">
            <p className="text-[11px] font-medium tracking-[0.28em] uppercase opacity-85">Summer 2026</p>
            <h1 className="mt-4 max-w-lg font-display text-4xl leading-[1.05] font-light md:text-5xl">
              Just arrived, cut for the season ahead
            </h1>
          </div>
        </div>
      </Reveal>
      <div className="shell">
        <Breadcrumbs items={[{ label: "New Arrivals" }]} />
        <div className="pt-6">
          <ShopView scope="new" />
        </div>
      </div>
    </div>
  );
}
