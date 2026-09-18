import { ImageIcon } from "lucide-react";
import type { DirectionContent } from "@/lib/content";

export function DirectionsCards({ directions }: { directions: DirectionContent[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {directions.map((direction) => (
        <article
          key={direction.id}
          className="group overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
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
            <div
              aria-hidden
              className="absolute inset-0 bg-[#ede8e4]/25 mix-blend-multiply"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/45 to-transparent px-4 pb-3 pt-14">
              <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                {direction.title}
              </h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {direction.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
