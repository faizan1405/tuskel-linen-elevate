"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sizeChart } from "@/lib/products";
import type { ReactNode } from "react";

export function SizeGuideModal({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-light">Size Guide</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-muted-foreground">
          Measurements are of the garment laid flat, in inches. Prototype figures — replace with
          confirmed production measurements.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                <th scope="col" className="py-2.5 pr-3">Size</th>
                <th scope="col" className="py-2.5 pr-3">Chest</th>
                <th scope="col" className="py-2.5 pr-3">Length</th>
                <th scope="col" className="py-2.5 pr-3">Shoulder</th>
                <th scope="col" className="py-2.5">Sleeve</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row) => (
                <tr key={row.size} className="border-b border-border/60">
                  <th scope="row" className="py-2.5 pr-3 font-medium">{row.size}</th>
                  <td className="py-2.5 pr-3">{row.chest}"</td>
                  <td className="py-2.5 pr-3">{row.length}"</td>
                  <td className="py-2.5 pr-3">{row.shoulder}"</td>
                  <td className="py-2.5">{row.sleeve}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground">
          Between two sizes? Our shirts are a regular fit — size up for a looser drape.
        </p>
      </DialogContent>
    </Dialog>
  );
}
