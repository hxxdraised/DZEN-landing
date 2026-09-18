import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewsWidget } from "@/components/sections/reviews-widget";

const CAROUSEL_WIDGET_ID = "wg_57d0c1aebbd4";

export function ReviewsSection() {
  return (
    <section className="container mx-auto px-4 py-24 lg:px-8">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
          Что говорят те, кто уже нашёл свой баланс
        </h2>
        <p className="mt-4 text-muted-foreground">
          Гости студии ДЗЕН делятся впечатлениями о занятиях, тренерах и атмосфере.
          Отзывы собраны с карты 2ГИС.
        </p>
      </div>
      <ReviewsWidget widgetId={CAROUSEL_WIDGET_ID} />
      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/reviews">
            Все отзывы
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
