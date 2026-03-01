import type { Metadata } from "next";
import { ContactInfoSection } from "@/components/sections/contact-info";
import { contactData } from "@/data/mock";

export const metadata: Metadata = {
  title: "Контакты",
};

export default function ContactsPage() {
  return <ContactInfoSection data={contactData} />;
}
