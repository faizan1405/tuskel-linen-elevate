import Link from "next/link";
import { SectionHeading } from "@/components/site/PageHeader";
import { sizeChart } from "@/lib/products";

export default function SizeGuidePage() {
  return (
    <div className="shell pb-24">
      <div className="py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Fit Guide</p>
          <h1 className="font-display text-4xl font-light md:text-5xl">Size Guide</h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
            All Tuskel shirts are cut in a regular fit — clean through the chest with a relaxed sleeve. If you are between sizes, we recommend sizing up for a more comfortable drape.
          </p>
        </div>

        <div className="mt-16 overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 font-medium">Size</th>
                <th className="pb-3 pr-4 font-medium">Chest (in)</th>
                <th className="pb-3 pr-4 font-medium">Length (in)</th>
                <th className="pb-3 pr-4 font-medium">Shoulder (in)</th>
                <th className="pb-3 font-medium">Sleeve (in)</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((s) => (
                <tr key={s.size} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium">{s.size}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.chest}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.length}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.shoulder}</td>
                  <td className="py-3 text-muted-foreground">{s.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border p-6">
            <p className="font-display text-lg font-light">How to Measure</p>
            <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
              <li><strong className="text-foreground">Chest:</strong> Measure under the arms at the fullest part.</li>
              <li><strong className="text-foreground">Length:</strong> Measure from the top of the shoulder to the hem.</li>
              <li><strong className="text-foreground">Shoulder:</strong> Measure from shoulder seam to shoulder seam.</li>
              <li><strong className="text-foreground">Sleeve:</strong> Measure from shoulder seam to wrist.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-6">
            <p className="font-display text-lg font-light">Fit Notes</p>
            <p className="mt-4 text-[13px] text-muted-foreground">Our shirts have a relaxed regular fit that works tucked or untucked. The body is cut with ease — not tight, not oversized. If you prefer a slimmer look, size down by one.</p>
          </div>
          <div className="rounded-lg border border-border p-6">
            <p className="font-display text-lg font-light">Need Help?</p>
            <p className="mt-4 text-[13px] text-muted-foreground">Unsure about sizing? Reach out to us at <a href="mailto:care@tuskel.com" className="link-underline">care@tuskel.com</a> or <a href="tel:+918859538859" className="link-underline">+91 88595 38859</a> and we will help you find the right fit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
