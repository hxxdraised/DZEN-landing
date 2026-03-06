import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { Trainer } from "@/data/mock";

interface TeamProps {
  data: Trainer[];
}

export function Team({ data }: TeamProps) {
  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Тренеры DZEN
      </h2>
      <p className="mx-auto mb-8 max-w-3xl text-center text-sm text-muted-foreground">
        Черным выделены направления в групповом расписании DZEN, синим — доступные
        для персональных тренировок.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((member) => (
          <Card key={member.name} className="gap-4">
            <CardHeader>
              <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                {member.name.slice(0, 1)}
              </div>
              <CardTitle className="text-center">{member.name}</CardTitle>
              <p className="text-center text-sm font-medium text-primary/80">
                {member.role}
              </p>
              <CardDescription className="mt-2 text-center">
                {member.experience}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {member.groupSpecializations.map((item) => (
                  <span
                    key={`${member.name}-group-${item}`}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
                  >
                    {item}
                  </span>
                ))}
                {member.personalSpecializations.map((item) => (
                  <span
                    key={`${member.name}-personal-${item}`}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{member.philosophy}</p>
              <details className="rounded-lg border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Образование и сертификации
                </summary>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {member.education.map((item) => (
                    <li key={`${member.name}-edu-${item}`}>• {item}</li>
                  ))}
                </ul>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
