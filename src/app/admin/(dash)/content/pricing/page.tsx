import { getPricingAdmin } from "@/lib/content";
import { PricingEditor } from "@/components/admin/pricing-editor";

export const metadata = {
  title: "Цены · Админ-панель",
  robots: { index: false, follow: false },
};

export default async function AdminContentPricingPage() {
  const blocks = await getPricingAdmin();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Цены и абонементы</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Блоки тарифов на странице «Цены». Изменения появляются на сайте сразу после сохранения.
      </p>
      <PricingEditor
        initial={blocks.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle ?? "",
          note: b.note ?? "",
          visible: b.visible,
          plans: b.plans.map((p) => ({
            id: p.id,
            name: p.name,
            label: p.label ?? "",
            details: p.details ?? "",
            audience: p.audience ?? "",
            duration: p.duration ?? "",
            fullPrice: p.fullPrice,
            discountPrice: p.discountPrice,
            ctaText: p.ctaText,
            visible: p.visible,
          })),
        }))}
      />
    </div>
  );
}
