import type { Metadata } from "next";
import { FaqList } from "@/components/sections/faq-list";
import { faqData } from "@/data/mock";

export const metadata: Metadata = {
  title: "Частые вопросы",
  description:
    "Ответы на частые вопросы о студии ДЗЕН: подготовка для новичков, размер групп, заморозка абонемента, отмена записи.",
  alternates: {
    canonical: "/faq",
  },
};

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <FaqList data={faqData} />
    </>
  );
}
