import type { Metadata } from "next";
import { Team } from "@/components/sections/team";
import { getTeam } from "@/lib/content";

export const metadata: Metadata = {
  title: "Команда",
  description: "Тренеры студии ДЗЕН: сертифицированные специалисты по йоге, пилатесу, растяжке и силовым направлениям.",
  alternates: {
    canonical: "/team",
  },
};

export const revalidate = 3600;

export default async function TeamPage() {
  const team = await getTeam();
  return <Team data={team} />;
}
