"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BrainIcon,
  SparklesIcon,
  UsersIcon,
  CompassIcon,
  type LucideIcon,
} from "lucide-react";
import type { Feature } from "@/data/mock";

const iconMap: Record<string, LucideIcon> = {
  brain: BrainIcon,
  sparkles: SparklesIcon,
  users: UsersIcon,
  compass: CompassIcon,
};

interface FeaturesProps {
  data: Feature[];
}

export function Features({ data }: FeaturesProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="container mx-auto px-4 py-24 lg:px-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center font-display text-3xl font-light tracking-tight sm:text-4xl"
      >
        Почему DZEN?
      </motion.h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((feature, i) => {
          const Icon = iconMap[feature.icon] ?? SparklesIcon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="group flex flex-col items-center text-center"
            >
              <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 transition-colors duration-200 group-hover:bg-primary/15">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold tracking-wide">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
