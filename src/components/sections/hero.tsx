import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HeroData } from "@/data/mock";

interface HeroProps {
  data: HeroData;
}

export function Hero({ data }: HeroProps) {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {data.title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
        {data.subtitle}
      </p>
      <Button asChild size="lg" className="mt-10">
        <Link href={data.ctaHref}>{data.ctaText}</Link>
      </Button>
    </section>
  );
}
