import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TeamMember } from "@/data/mock";

interface TeamProps {
  data: TeamMember[];
}

export function Team({ data }: TeamProps) {
  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Наша команда
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((member) => (
          <Card key={member.name}>
            <CardHeader>
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                {member.name.charAt(0)}
              </div>
              <CardTitle className="text-center">{member.name}</CardTitle>
              <p className="text-center text-sm font-medium text-primary">
                {member.role}
              </p>
              <CardDescription className="mt-2 text-center">
                {member.bio}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
