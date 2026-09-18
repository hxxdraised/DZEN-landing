import type { Metadata } from "next";
import { Team } from "@/components/sections/team";
import { aboutData, teamData } from "@/data/mock";

export const metadata: Metadata = {
  title: "О нас",
};

export default function AboutPage() {
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
      <Team data={teamData} />
    </>
  );
}
