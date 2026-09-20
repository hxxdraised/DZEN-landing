import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewsWidget } from "@/components/sections/reviews-widget";
import {
  SectionBlock,
  SectionFadeItem,
} from "@/components/sections/section-block";

const CAROUSEL_WIDGET_ID = "wg_57d0c1aebbd4";

export function ReviewsSection() {
  return (
    <SectionBlock
      title="Что говорят те, кто уже нашёл свой баланс"
      description="Гости студии ДЗЕН делятся впечатлениями о занятиях, тренерах и атмосфере. Отзывы собраны с карты 2ГИС."
    >
      <SectionFadeItem>
        <ReviewsWidget widgetId={CAROUSEL_WIDGET_ID} />
      </SectionFadeItem>
      <SectionFadeItem delay={0.1} className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/reviews">
            Все отзывы
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
      </SectionFadeItem>
    </SectionBlock>
  );
}
