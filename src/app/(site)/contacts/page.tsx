import type { Metadata } from "next";
import { ContactInfoSection } from "@/components/sections/contact-info";
import { contactData } from "@/data/mock";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Студия ДЗЕН в Казани: ул. Серова, 26. Телефон 8 (965) 623-33-28, Instagram, WhatsApp и Telegram. Запись на пробное занятие онлайн.",
  alternates: {
    canonical: "/contacts",
  },
};

export default function ContactsPage() {
  return <ContactInfoSection data={contactData} />;
}
