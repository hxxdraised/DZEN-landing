"use client";

import { useRef, type ComponentType, type SVGProps } from "react";
import { motion, useInView } from "framer-motion";
import {
  MeditationIcon,
  LotusIcon,
  TeacherIcon,
  ZenIcon,
} from "@/components/icons/feature-icons";
import { SectionBlock } from "@/components/sections/section-block";
import type { Feature } from "@/data/mock";

type FeatureIcon = ComponentType<SVGProps<SVGSVGElement>>;

const iconMap: Record<string, FeatureIcon> = {
  meditation: MeditationIcon,
  lotus: LotusIcon,
  teacher: TeacherIcon,
  zen: ZenIcon,
};

interface FeaturesProps {
  data: Feature[];
}

export function Features({ data }: FeaturesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionBlock title="Почему ДЗЕН?">
      <div ref={ref} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((feature, i) => {
          const Icon = iconMap[feature.icon] ?? LotusIcon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="group flex flex-col items-center text-center"
            >
              <div className="mb-5 flex size-28 items-center justify-center rounded-full bg-primary/10 transition-colors duration-200 group-hover:bg-primary/15">
                <Icon className="size-12 text-primary" />
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
    </SectionBlock>
  );
}
