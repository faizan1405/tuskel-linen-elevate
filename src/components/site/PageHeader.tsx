import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <header
      className={
        align === "center"
          ? "mx-auto max-w-2xl pb-12 text-center md:pb-16"
          : "max-w-2xl pb-12 md:pb-16"
      }
    >
      <Reveal>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="text-4xl leading-[1.05] md:text-5xl lg:text-6xl">{title}</h1>
        {intro && (
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
        )}
      </Reveal>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl leading-[1.1] md:text-4xl lg:text-[2.75rem]">{title}</h2>
      {intro && (
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
      )}
    </Reveal>
  );
}
