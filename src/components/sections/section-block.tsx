"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionBlockProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SectionBlock({
  title,
  description,
  children,
  className,
}: SectionBlockProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className={cn("container mx-auto px-4 py-24 lg:px-8", className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-14 max-w-3xl text-center"
      >
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-muted-foreground">{description}</p>
        ) : null}
      </motion.div>
      {children}
    </section>
  );
}

interface SectionFadeItemProps {
  delay?: number;
  className?: string;
  children: ReactNode;
}

export function SectionFadeItem({
  delay = 0,
  className,
  children,
}: SectionFadeItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
