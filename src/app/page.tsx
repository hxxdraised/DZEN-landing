import Link from "next/link";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { heroData, featuresData, aboutData } from "@/data/mock";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Hero data={heroData} />
      <Features data={featuresData} />
      <section className="container mx-auto max-w-4xl px-4 py-24">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {aboutData.title}
        </h2>
        <p className="mt-6 text-center text-muted-foreground">{aboutData.description}</p>
        <p className="mt-4 text-center text-muted-foreground">{aboutData.mission}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {aboutData.benefits.map((benefit) => (
            <li key={benefit} className="rounded-xl border bg-card p-4 text-sm">
              {benefit}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="font-medium text-primary">{aboutData.trialPrice}</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/schedule">Смотреть расписание</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Посмотреть цены</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
