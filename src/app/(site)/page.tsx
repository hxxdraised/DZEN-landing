import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { ReviewsSection } from "@/components/sections/reviews";
import {
  SectionBlock,
  SectionFadeItem,
} from "@/components/sections/section-block";
import { heroData, featuresData, aboutData } from "@/data/mock";
import { getDirections } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ДЗЕН — студия растяжки и йоги в Казани",
  description:
    "Студия растяжки, йоги и пилатеса в Казани: 14 направлений, единый абонемент на всё, сертифицированные тренеры. Пробное занятие — 450 ₽. Онлайн-расписание и запись.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ДЗЕН — ваше пространство баланса в Казани",
    description:
      "Тонус, гибкость и гармония — в одной студии. 14 направлений, единый абонемент, пробное занятие 450 ₽.",
    url: "/",
  },
};

export const revalidate = 3600;

export default async function HomePage() {
  const categories = await getDirections();
  const directionTitles = categories.flatMap((category) =>
    category.directions.map((direction) => direction.title)
  );

  return (
    <>
      <Hero data={heroData} />
      <Features data={featuresData} />
      <SectionBlock
        title={aboutData.title}
        description={aboutData.mission}
        className="max-w-4xl"
      >
        {directionTitles.length > 0 && (
          <SectionFadeItem className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {directionTitles.map((title) => (
              <Badge key={title} variant="soft" className="px-4 py-1.5 text-sm">
                {title}
              </Badge>
            ))}
          </SectionFadeItem>
        )}
        {directionTitles.length > 0 && (
          <SectionFadeItem delay={0.1} className="mt-6 flex justify-center">
            <Button asChild variant="link">
              <Link href="/directions">Подробнее о направлениях</Link>
            </Button>
          </SectionFadeItem>
        )}
        <SectionFadeItem
          delay={0.15}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <p className="font-medium text-primary">{aboutData.trialPrice}</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/schedule">Смотреть расписание</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Посмотреть цены</Link>
            </Button>
          </div>
        </SectionFadeItem>
      </SectionBlock>
      <ReviewsSection />
    </>
  );
}
