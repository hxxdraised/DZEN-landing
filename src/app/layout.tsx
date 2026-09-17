import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadProvider } from "@/components/lead/lead-provider";
import { siteConfig } from "@/data/mock";
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

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
        <LeadProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LeadProvider>
      </body>
    </html>
  );
}
