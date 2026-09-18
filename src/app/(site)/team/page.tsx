import type { Metadata } from "next";
import { Team } from "@/components/sections/team";
import { teamData } from "@/data/mock";

export const metadata: Metadata = {
  title: "Команда",
};

export default function TeamPage() {
  return <Team data={teamData} />;
}
