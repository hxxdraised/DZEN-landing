import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/data/mock";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            {siteConfig.name}
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            {siteConfig.footer.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="my-6" />
        <p className="text-center text-sm text-muted-foreground">
          {siteConfig.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
