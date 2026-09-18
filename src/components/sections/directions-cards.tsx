"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { ModalShell } from "@/components/ui/modal-shell";
import type { DirectionContent } from "@/lib/content";

export function DirectionsCards({ directions }: { directions: DirectionContent[] }) {
  const [selected, setSelected] = useState<DirectionContent | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {directions.map((direction) => (
          <article
            key={direction.id}
            className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border bg-muted/40 transition-colors hover:border-primary/40"
            onClick={() => setSelected(direction)}
          >
            {direction.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={direction.photoUrl}
                alt={direction.title}
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                <ImageIcon className="size-10" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent px-4 pb-4 pt-12">
              <h3 className="text-base font-semibold leading-snug text-foreground">
                {direction.title}
              </h3>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {direction.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <ModalShell title={selected.title} onClose={() => setSelected(null)}>
          {selected.photoUrl && (
            <div className="aspect-[3/4] w-full max-w-60 overflow-hidden rounded-xl border border-dashed">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.photoUrl}
                alt={selected.title}
                className="size-full object-cover"
                draggable={false}
              />
            </div>
          )}
          <p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
        </ModalShell>
      )}
    </>
  );
}
