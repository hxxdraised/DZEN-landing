import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadProvider } from "@/components/lead/lead-provider";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LeadProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </LeadProvider>
  );
}
