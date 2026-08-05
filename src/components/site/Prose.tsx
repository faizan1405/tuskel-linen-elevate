import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl space-y-5 text-[15px] leading-[1.75] text-muted-foreground [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-foreground [&_h3]:mt-8 [&_h3]:font-sans [&_h3]:text-[14px] [&_h3]:font-medium [&_h3]:text-foreground [&_li]:mb-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      {children}
    </div>
  );
}
