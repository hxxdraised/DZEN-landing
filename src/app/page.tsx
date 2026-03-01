import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { heroData, featuresData } from "@/data/mock";

export default function HomePage() {
  return (
    <>
      <Hero data={heroData} />
      <Features data={featuresData} />
    </>
  );
}
