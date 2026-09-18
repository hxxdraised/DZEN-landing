"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMemberContent } from "@/lib/content";

interface TeamProps {
  data: TeamMemberContent[];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Team({ data }: TeamProps) {
  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Тренеры DZEN
      </h2>
      <p className="mx-auto mb-4 max-w-3xl text-center text-sm text-muted-foreground">
        Нажмите на карточку, чтобы узнать больше о тренере
      </p>
      <p className="mx-auto mb-8 max-w-3xl text-center text-sm text-muted-foreground">
        Черным выделены направления в групповом расписании DZEN, цветным — доступные для
        персональных тренировок.
      </p>
      <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

function TeamCard({ member }: { member: TeamMemberContent }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={cn(
        "group cursor-pointer overflow-hidden rounded-2xl border bg-card transition-colors",
        open ? "border-primary/40 sm:col-span-2 lg:col-span-1" : "hover:border-primary/40"
      )}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="aspect-[4/5] max-h-72 w-full overflow-hidden border-b border-dashed bg-muted/40">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoUrl}
            alt={member.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="flex size-28 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground/60">
              {initials(member.name)}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-center font-semibold">{member.name}</h3>
        <p className="mt-0.5 text-center text-sm font-medium text-primary/80">{member.role}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {member.groupSpecializations.map((item) => (
            <span
              key={`${member.id}-group-${item}`}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
          {member.personalSpecializations.map((item) => (
            <span
              key={`${member.id}-personal-${item}`}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
            >
              {item}
            </span>
          ))}
        </div>

        <p
          className={cn(
            "mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground/70 transition-transform",
            open && "rotate-180"
          )}
        >
          <ChevronDownIcon className="size-4" />
          {open ? "свернуть" : "подробнее"}
        </p>

        {open && (
          <div className="mt-4 space-y-4 border-t border-dashed pt-4 text-left">
            <div>
              <h4 className="text-sm font-semibold">Философия</h4>
              <p className="mt-1 text-sm italic text-muted-foreground">{member.philosophy}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Опыт и подход</h4>
              <p className="mt-1 text-sm text-muted-foreground">{member.experience}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Образование и сертификации</h4>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {member.education.map((item) => (
                  <li key={`${member.id}-edu-${item}`}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
