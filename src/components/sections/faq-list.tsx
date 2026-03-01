import type { FaqItem } from "@/data/mock";

interface FaqListProps {
  data: FaqItem[];
}

export function FaqList({ data }: FaqListProps) {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Часто задаваемые вопросы
      </h2>
      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.question} className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold">{item.question}</h3>
            <p className="mt-2 text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
