import type { Metadata } from "next";
import { FaqList } from "@/components/sections/faq-list";
import { faqData } from "@/data/mock";

export const metadata: Metadata = {
  title: "FAQ",
};

export default function FaqPage() {
  return <FaqList data={faqData} />;
}
