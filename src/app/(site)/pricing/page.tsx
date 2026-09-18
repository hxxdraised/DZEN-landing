import type { Metadata } from "next";
import { LeadButton } from "@/components/lead/lead-button";
import { formatPrice, getPricing } from "@/lib/content";
import { benefitsData, studioRules } from "@/data/mock";

export const metadata: Metadata = {
  title: "Цены и абонементы",
  description:
    "Абонементы студии ДЗЕН: пробные занятия, «Фокус» на 4 недели, гибкие абонементы с заморозкой, персональные и парные тренировки. Единый абонемент на все 14 направлений.",
  alternates: {
    canonical: "/pricing",
  },
};

export const revalidate = 3600;

export default async function PricingPage() {
  const blocks = await getPricing();

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto mb-14 max-w-4xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Ваше тело — ваш график — ваш абонемент
        </h1>
        <p className="mt-4 text-muted-foreground">
          В ДЗЕН нет шаблонов. Выбирайте ритм, который подходит именно вам: интенсив на 4 недели
          или гибкий график с возможностью заморозки. По любому абонементу доступны все 14
          направлений студии.
        </p>
      </div>

      <div className="space-y-10">
        {blocks.map((block) => (
          <section key={block.id} className="rounded-2xl border p-6">
            <h2 className="font-display text-2xl font-semibold">{block.title}</h2>
            {block.subtitle && <p className="mt-2 text-sm text-muted-foreground">{block.subtitle}</p>}
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {block.plans.map((plan) => (
                <article key={plan.id} className="flex flex-col rounded-xl border p-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.label && <p className="mt-1 text-sm font-medium text-primary">{plan.label}</p>}
                  {plan.details && (
                    <p className="mt-2 text-sm text-muted-foreground">{plan.details}</p>
                  )}
                  {plan.audience && (
                    <p className="mt-1 text-sm text-muted-foreground italic">{plan.audience}</p>
                  )}
                  {plan.duration && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Срок действия: {plan.duration}
                    </p>
                  )}
                  <div className="mt-3 space-y-1">
                    {plan.discountPrice !== null && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(plan.fullPrice)}
                      </p>
                    )}
                    <p
                      className={
                        plan.discountPrice !== null
                          ? "text-xl font-semibold text-primary"
                          : "text-xl font-semibold"
                      }
                    >
                      {formatPrice(plan.discountPrice ?? plan.fullPrice)}
                    </p>
                  </div>
                  <div className="mt-auto pt-4">
                    <LeadButton
                      source={`Тариф «${plan.name}» (${block.title})`}
                      label={plan.ctaText}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                </article>
              ))}
            </div>
            {block.note && <p className="mt-5 text-xs text-muted-foreground">{block.note}</p>}
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border p-6">
        <h2 className="font-display text-2xl font-semibold">Ваши преимущества в ДЗЕН</h2>
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
