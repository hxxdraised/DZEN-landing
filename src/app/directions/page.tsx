import type { Metadata } from "next";
import { directionsData } from "@/data/mock";

export const metadata: Metadata = {
  title: "Направления",
};

export default function DirectionsPage() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Направления
        </h1>
        <p className="mt-4 text-muted-foreground">
          Создайте свой идеальный баланс: от мягких практик восстановления до
          энергичных силовых и танцевальных классов.
        </p>
      </div>
      <div className="space-y-10">
        {directionsData.map((category) => (
          <section key={category.title}>
            <h2 className="mb-5 font-display text-2xl font-semibold">{category.title}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {category.directions.map((direction) => (
                <article key={direction.title} className="rounded-xl border bg-card p-5">
                  <h3 className="text-lg font-semibold">{direction.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {direction.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
