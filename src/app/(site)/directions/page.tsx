import type { Metadata } from "next";
import { getDirections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Направления",
  description:
    "Направления студии DZEN: растяжка, сила и тонус, йога и осознанность, танцевальные классы.",
};

export const revalidate = 3600;

export default async function DirectionsPage() {
  const categories = await getDirections();

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Создайте свой идеальный баланс
        </h1>
        <p className="mt-4 text-muted-foreground">
          От осознанного расслабления до энергичной работы. Выбирайте то, что нужно вашему телу
          сегодня.
        </p>
      </div>
      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category.id}>
            <h2 className="mb-5 font-display text-2xl font-semibold">{category.title}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {category.directions.map((direction) => (
                <article key={direction.id} className="rounded-xl border bg-card p-5">
                  <h3 className="text-lg font-semibold">{direction.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{direction.description}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
