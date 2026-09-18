"use client";

import { useState } from "react";
import { ModalShell } from "@/components/ui/modal-shell";
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
  const [selected, setSelected] = useState<TeamMemberContent | null>(null);

  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="mb-12 text-center font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Тренеры ДЗЕН
      </h2>
      <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((member) => (
          <TeamCard key={member.id} member={member} onOpen={() => setSelected(member)} />
        ))}
      </div>

      {selected && <TeamModal member={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function TeamCard({
  member,
  onOpen,
}: {
  member: TeamMemberContent;
  onOpen: () => void;
}) {
  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/40"
      onClick={onOpen}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoUrl}
            alt={member.name}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-28 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground/60">
              {initials(member.name)}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent px-4 pb-3 pt-10">
          <h3 className="text-base font-semibold leading-snug text-foreground">{member.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{member.role}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-1.5">
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
      </div>
    </article>
  );
}

function TeamModal({ member, onClose }: { member: TeamMemberContent; onClose: () => void }) {
  return (
    <ModalShell title={member.name} onClose={onClose}>
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="aspect-[3/4] w-full shrink-0 overflow-hidden rounded-xl border border-dashed bg-muted/40 sm:w-44">
          {member.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photoUrl}
              alt={member.name}
              className="size-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="flex size-24 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground/60">
                {initials(member.name)}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary/80">{member.role}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.groupSpecializations.map((item) => (
              <span
                key={`${member.id}-m-group-${item}`}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
              >
                {item}
              </span>
            ))}
            {member.personalSpecializations.map((item) => (
              <span
                key={`${member.id}-m-personal-${item}`}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
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
              <li key={`${member.id}-m-edu-${item}`}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </ModalShell>
  );
}
