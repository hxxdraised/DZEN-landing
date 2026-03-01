import {
  BrainIcon,
  SparklesIcon,
  UsersIcon,
  CompassIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Feature } from "@/data/mock";

const iconMap: Record<string, LucideIcon> = {
  brain: BrainIcon,
  sparkles: SparklesIcon,
  users: UsersIcon,
  compass: CompassIcon,
};

interface FeaturesProps {
  data: Feature[];
}

export function Features({ data }: FeaturesProps) {
  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Почему DZEN?
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((feature) => {
          const Icon = iconMap[feature.icon] ?? SparklesIcon;
          return (
            <Card key={feature.title} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
