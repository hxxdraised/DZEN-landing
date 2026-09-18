"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react";
import type { DirectionContent } from "@/lib/content";
import { cn } from "@/lib/utils";

const GAP = 16;

export function DirectionsCards({ directions }: { directions: DirectionContent[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows, directions]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + GAP : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="group/slider relative @container">
      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="mx-[calc(50%-50vw)] flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[calc(50vw-50cqw)] px-[calc(50vw-50cqw)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {directions.map((direction) => (
          <article
            key={direction.id}
            data-card
            className="group w-[100cqw] shrink-0 select-none snap-start overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40 md:w-[calc(50cqw-0.5rem)] xl:w-[calc(25cqw-0.75rem)]"
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
                className="absolute inset-0 bg-[#ede8e4]/25 transition-opacity duration-500 group-hover:opacity-0"
              />
              <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-card/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
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

      <button
        type="button"
        aria-label="Прокрутить влево"
        onClick={() => scrollByCard(-1)}
        className={cn(
          "absolute left-2 top-1/2 z-10 flex size-16 -translate-y-1/2 items-center justify-center rounded-full border bg-card/95 text-foreground shadow-md backdrop-blur transition-all hover:border-primary/40 hover:text-primary active:scale-95",
          canScrollLeft
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <ChevronLeftIcon className="size-8" />
      </button>
      <button
        type="button"
        aria-label="Прокрутить вправо"
        onClick={() => scrollByCard(1)}
        className={cn(
          "absolute right-2 top-1/2 z-10 flex size-16 -translate-y-1/2 items-center justify-center rounded-full border bg-card/95 text-foreground shadow-md backdrop-blur transition-all hover:border-primary/40 hover:text-primary active:scale-95",
          canScrollRight
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <ChevronRightIcon className="size-8" />
      </button>
    </div>
  );
}
