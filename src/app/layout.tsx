import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { YandexMetrica } from "@/components/metrics/yandex-metrica";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-cormorant",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ДЗЕН — студия растяжки и йоги в Казани",
    template: "%s | ДЗЕН — студия в Казани",
  },
  description:
    "Студия растяжки, йоги и пилатеса в Казани: 14 направлений, единый абонемент на всё, сертифицированные тренеры. Пробное занятие — 450 ₽. Онлайн-расписание и запись.",
  applicationName: "ДЗЕН",
  keywords: [
    "растяжка казань",
    "йога казань",
    "пилатес казань",
    "стретчинг казань",
    "студия растяжки казань",
    "аэропилатес казань",
    "запись на занятия казань",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "ДЗЕН",
    title: "ДЗЕН — ваше пространство баланса в Казани",
    description:
      "Тонус, гибкость и гармония — в одной студии. 14 направлений, единый абонемент, пробное занятие 450 ₽.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Студия растяжки и йоги ДЗЕН в Казани",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ДЗЕН — ваше пространство баланса в Казани",
    description:
      "Тонус, гибкость и гармония — в одной студии. Пробное занятие 450 ₽.",
    images: ["/og.jpg"],
  },
  verification: {
    yandex: process.env.YANDEX_VERIFICATION,
    google: process.env.GOOGLE_VERIFICATION,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}
      >
        {children}
        <YandexMetrica />
      </body>
    </html>
  );
}
