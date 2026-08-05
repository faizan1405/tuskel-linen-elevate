import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import hero from "@/assets/hero.jpg";

export function HomeHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section ref={ref} className="relative h-[92svh] min-h-[560px] w-full overflow-hidden -mt-16 lg:-mt-[74px]">
      <motion.div
        className="absolute inset-0"
        style={{ y }}
        initial={{ scale: reduce ? 1 : 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease }}
      >
        <img
          src={hero}
          alt="Man wearing a Tuskel soft turquoise pure linen shirt in a sunlit travertine courtyard"
          width={1600}
          height={1104}
          fetchPriority="high"
          className="h-full w-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.22_0.006_60/0.55)] via-[oklch(0.22_0.006_60/0.25)] to-transparent" />
      </motion.div>

      <div className="shell relative flex h-full items-end pb-20 md:items-center md:pb-0">
        <motion.div
          className="max-w-xl text-[oklch(0.977_0.006_85)]"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }}
        >
          {[
            <p key="e" className="text-[11px] font-medium tracking-[0.28em] uppercase opacity-85">
              Tuskel Summer 2026
            </p>,
            <h1 key="h" className="mt-5 font-display text-[2.6rem] leading-[1.04] font-light md:text-6xl lg:text-[4.25rem]">
              Made for warmer days.
              <br />
              Designed for sharper ones.
            </h1>,
            <p key="p" className="mt-6 max-w-md text-[15px] leading-relaxed opacity-90">
              Premium linen shirts crafted for effortless comfort, timeless style and modern living.
            </p>,
            <div key="c" className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/collections/pure-linen"
                className="min-h-12 bg-[oklch(0.977_0.006_85)] px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] text-foreground uppercase transition-opacity hover:opacity-85"
              >
                Shop Pure Linen
              </Link>
              <Link
                to="/collections/linen-blend"
                className="min-h-12 border border-[oklch(0.977_0.006_85/0.6)] px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors hover:bg-[oklch(0.977_0.006_85/0.12)]"
              >
                Explore Linen Blend
              </Link>
            </div>,
          ].map((child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 26 },
                show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
              }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-6 hidden justify-center md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.span
          animate={{ y: reduce ? 0 : [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-[oklch(0.977_0.006_85)]"
        >
          <span className="text-[10px] tracking-[0.24em] uppercase opacity-80">Scroll</span>
          <ArrowDown className="h-4 w-4 opacity-80" aria-hidden="true" />
        </motion.span>
      </motion.div>
    </section>
  );
}
