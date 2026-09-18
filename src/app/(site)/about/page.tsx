import type { Metadata } from "next";
import { Team } from "@/components/sections/team";
import { aboutData } from "@/data/mock";
import { getTeam } from "@/lib/content";

export const metadata: Metadata = {
  title: "О студии",
  description:
    "Философия студии ДЗЕН: гармония через движение. Сертифицированные тренеры, мини-группы и комплексный подход к тренировкам в Казани.",
  alternates: {
    canonical: "/about",
  },
};

export const revalidate = 3600;

export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <section className="container mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {aboutData.title}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          {aboutData.description}
        </p>
        <blockquote className="mt-8 border-l-4 border-primary pl-6 text-left italic text-muted-foreground">
          {aboutData.mission}
        </blockquote>
      </section>
      <Team data={team} headingLevel="h2" />
    </>
  );
}
