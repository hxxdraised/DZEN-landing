import type { Metadata } from "next";
import { benefitsData, pricingData, studioRules } from "@/data/mock";

export const metadata: Metadata = {
  title: "Цены",
};

export default function PricingPage() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto mb-14 max-w-4xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Ваше тело — ваш график — ваш абонемент
        </h1>
        <p className="mt-4 text-muted-foreground">
          В DZEN нет шаблонов. Выбирайте ритм, который подходит именно вам: интенсив
          на 4 недели или гибкий график с возможностью заморозки.
        </p>
      </div>

      <div className="space-y-10">
        {pricingData.map((block) => (
          <section key={block.title} className="rounded-2xl border p-6">
            <h2 className="font-display text-2xl font-semibold">{block.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{block.subtitle}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {block.plans.map((plan) => (
                <article key={`${block.title}-${plan.name}`} className="rounded-xl border p-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.label ? (
                    <p className="mt-1 text-sm font-medium text-primary">{plan.label}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-muted-foreground">{plan.details}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Срок действия: {plan.duration}
                  </p>
                  <div className="mt-3 space-y-1">
                    {plan.fullPrice ? (
                      <p className="text-sm text-muted-foreground">Полная: {plan.fullPrice}</p>
                    ) : null}
                    {plan.discountPrice ? (
                      <p className="font-medium text-primary">
                        Со скидкой: {plan.discountPrice}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm font-medium">{plan.ctaText}</p>
                </article>
              ))}
            </div>
            {block.note ? (
              <p className="mt-5 text-sm text-muted-foreground">{block.note}</p>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border p-6">
        <h2 className="font-display text-2xl font-semibold">Ваши преимущества в DZEN</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {benefitsData.map((item) => (
            <li key={item.title}>
              <span className="font-medium text-foreground">{item.title}:</span>{" "}
              {item.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="font-display text-2xl font-semibold">Правила студии</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {studioRules.map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
