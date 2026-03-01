"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HeroData } from "@/data/mock";

interface HeroProps {
  data: HeroData;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Hero({ data }: HeroProps) {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 pt-[72px]">
      {/* Subtle decorative circle */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[min(80vw,600px)] rounded-full border border-primary/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[min(60vw,440px)] rounded-full border border-primary/5"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
      >
        {/* Highlights as badges */}
        <motion.div variants={fadeUp} className="mb-8 flex flex-wrap justify-center gap-2">
          {data.highlights.map((h) => (
            <Badge key={h} variant="outline" className="text-xs">
              {h}
            </Badge>
          ))}
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-5xl font-light leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {data.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          {data.subtitle}
        </motion.p>

        {/* CTA button */}
        <motion.div variants={fadeUp} className="mt-10">
          <Button asChild size="lg">
            <Link href={data.ctaHref}>{data.ctaText}</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
