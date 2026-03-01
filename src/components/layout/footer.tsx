"use client";

import Link from "next/link";
import { MailIcon, PhoneIcon, MapPinIcon, ArrowUpIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { siteConfig, contactData } from "@/data/mock";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="font-display text-3xl font-semibold tracking-wide text-foreground"
            >
              {siteConfig.name}
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <Button
              asChild
              size="sm"
              className="mt-2 w-fit"
            >
              <Link href="/contacts">Записаться</Link>
            </Button>
          </div>

          {/* Navigation column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-lg font-semibold tracking-wide text-foreground">
              Навигация
            </h4>
            <nav className="flex flex-col gap-2.5">
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              {siteConfig.footer.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="w-fit text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-lg font-semibold tracking-wide text-foreground">
              Контакты
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={`tel:${contactData.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
              >
                <PhoneIcon className="size-4 shrink-0 text-primary/60" />
                {contactData.phone}
              </a>
              <a
                href={`mailto:${contactData.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
              >
                <MailIcon className="size-4 shrink-0 text-primary/60" />
                {contactData.email}
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary/60" />
                {contactData.address}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/60" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {siteConfig.footer.copyright}
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={scrollToTop}
            aria-label="Наверх"
            className="rounded-full"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
