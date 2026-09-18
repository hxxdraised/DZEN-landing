import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadProvider } from "@/components/lead/lead-provider";
import { contactData, socialLinks } from "@/data/mock";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    name: "Спортивная студия Айсылу Абдуллиной «DZEN»",
    alternateName: "Студия ДЗЕН",
    description:
      "Студия растяжки, йоги и пилатеса в Казани. 14 направлений, единый абонемент, групповые и персональные тренировки.",
    url: siteUrl,
    telephone: `+7${contactData.phone.replace(/\D/g, "").replace(/^8/, "")}`,
    priceRange: "450–27000 ₽",
    image: [`${siteUrl}/og.jpg`],
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Серова, 26",
      addressLocality: "Казань",
      addressRegion: "Республика Татарстан",
      addressCountry: "RU",
    },
    sameAs: [
      socialLinks.instagram,
      socialLinks.whatsapp,
      socialLinks.telegram,
      socialLinks.telegramChannel,
    ],
  };
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LeadProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <Header />
      <main>{children}</main>
      <Footer />
    </LeadProvider>
  );
}
