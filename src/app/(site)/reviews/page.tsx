import type { Metadata } from "next";
import { ReviewsWidget } from "@/components/sections/reviews-widget";

const GRID_WIDGET_ID = "wg_93563710e5d2";

export const metadata: Metadata = {
  title: "Отзывы",
  description:
    "Подлинные отзывы гостей студии ДЗЕН из 2ГИС — реальные истории о занятиях йогой, растяжкой и пилатесом в Казани.",
  alternates: {
    canonical: "/reviews",
  },
};

export default function ReviewsPage() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Истории из пространства баланса
        </h1>
        <p className="mt-4 text-muted-foreground">
          Подлинные отзывы гостей студии ДЗЕН, собранные с карты 2ГИС, — без
          редактуры и прикрас. Пусть чужой опыт поможет вам сделать первый шаг
          навстречу своему балансу.
        </p>
      </div>
      <ReviewsWidget widgetId={GRID_WIDGET_ID} />
    </section>
  );
}
