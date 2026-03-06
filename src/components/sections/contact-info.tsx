import { MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ContactInfo } from "@/data/mock";

interface ContactInfoProps {
  data: ContactInfo;
}

export function ContactInfoSection({ data }: ContactInfoProps) {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-24">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Контакты
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.email ? (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <MailIcon className="size-6 text-primary" />
              </div>
              <CardTitle className="text-base">Email</CardTitle>
              <CardDescription>
                <a
                  href={`mailto:${data.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {data.email}
                </a>
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <PhoneIcon className="size-6 text-primary" />
            </div>
            <CardTitle className="text-base">Телефон</CardTitle>
            <CardDescription>
              <a
                href={`tel:${data.phone}`}
                className="transition-colors hover:text-foreground"
              >
                {data.phone}
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <MapPinIcon className="size-6 text-primary" />
            </div>
            <CardTitle className="text-base">Адрес</CardTitle>
            <CardDescription>{data.address}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-base">Соцсети</CardTitle>
            <CardDescription className="space-y-1">
              <a
                href={data.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-foreground"
              >
                Instagram
              </a>
              <a
                href={data.social.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-foreground"
              >
                WhatsApp
              </a>
              <a
                href={data.social.telegram}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-foreground"
              >
                Telegram
              </a>
              <a
                href={data.social.telegramChannel}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-foreground"
              >
                Telegram-канал
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
