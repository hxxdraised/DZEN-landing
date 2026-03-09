"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon, PhoneIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { siteConfig, contactData, socialLinks } from "@/data/mock";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled && !mobileOpen
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-[72px] items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-wide text-foreground transition-colors duration-200 hover:text-primary"
        >
          {siteConfig.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200",
                pathname === item.href
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              )}
            >
              {item.label}
              {pathname === item.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-4 -bottom-0.5 h-px bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href={socialLinks.telegram}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-foreground/70 transition-colors duration-200 hover:text-primary"
          >
            Telegram
          </a>
          <a
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-foreground/70 transition-colors duration-200 hover:text-primary"
          >
            WhatsApp
          </a>
          <a
            href={`tel:${contactData.phone.replace(/\D/g, "")}`}
            className="flex items-center gap-1.5 text-sm text-foreground/70 transition-colors duration-200 hover:text-primary"
          >
            <PhoneIcon className="size-3.5" />
            {contactData.phone}
          </a>
          <Button asChild size="sm">
            <Link href="/contacts">Записаться</Link>
          </Button>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="relative z-50 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent/50 md:hidden"
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XIcon className="size-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MenuIcon className="size-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-40 bg-background/98 backdrop-blur-sm md:hidden"
                >
                  <nav className="flex h-full flex-col items-center justify-center gap-6">
                    {siteConfig.navigation.map((item, i) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.3 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "font-display text-3xl font-light tracking-wide transition-colors duration-200",
                            pathname === item.href
                              ? "text-primary"
                              : "text-foreground/70 hover:text-primary"
                          )}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.05 * siteConfig.navigation.length,
                        duration: 0.3,
                      }}
                      className="mt-4 flex flex-col items-center gap-4"
                    >
                      <a
                        href={`tel:${contactData.phone.replace(/\D/g, "")}`}
                        className="text-sm text-foreground/70 transition-colors hover:text-primary"
                      >
                        {contactData.phone}
                      </a>
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <a href={socialLinks.telegram} target="_blank" rel="noreferrer">
                          Telegram
                        </a>
                        <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
                          WhatsApp
                        </a>
                      </div>
                      <Button asChild size="lg" onClick={() => setMobileOpen(false)}>
                        <Link href="/contacts">Записаться</Link>
                      </Button>
                    </motion.div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </header>
  );
}
