export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLinks {
  instagram: string;
  whatsapp: string;
  telegram: string;
  telegramChannel: string;
}

export interface HeroData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  highlights: string[];
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface AboutData {
  title: string;
  mission: string;
  trialPrice: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactInfo {
  email?: string;
  phone: string;
  address: string;
  social: SocialLinks;
}

export interface BenefitItem {
  title: string;
  description: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  navigation: NavItem[];
  footer: {
    copyright: string;
    links: NavItem[];
  };
}

export const siteConfig: SiteConfig = {
  name: "ДЗЕН",
  description: "Студия растяжки, йоги и осознанного движения в Казани",
  navigation: [
    { label: "Главная", href: "/" },
    { label: "Направления", href: "/directions" },
    { label: "Расписание", href: "/schedule" },
    { label: "Команда", href: "/team" },
    { label: "Цены", href: "/pricing" },
    { label: "Отзывы", href: "/reviews" },
    { label: "Контакты", href: "/contacts" },
  ],
  footer: {
    copyright: `© ${new Date().getFullYear()} ДЗЕН, Казань. Все права защищены.`,
    links: [
      { label: "Политика конфиденциальности", href: "/privacy" },
      { label: "FAQ", href: "/faq" },
    ],
  },
};

export const heroData: HeroData = {
  title: "ДЗЕН — ваше пространство баланса в Казани",
  subtitle:
    "Тонус, гибкость и гармония — в одной студии. Тренируйтесь в комфортном для себя темпе с гибким абонементом без долгих обязательств.",
  ctaText: "Записаться на пробное занятие",
  ctaHref: "/contacts",
  highlights: ["Йога", "Растяжка", "Пилатес", "Силовые", "Танцы"],
};

export const featuresData: Feature[] = [
  {
    title: "Единый абонемент",
    description:
      "Одна подписка открывает доступ ко всем направлениям студии. Комбинируйте занятия так, как удобно именно вам.",
    icon: "meditation",
  },
  {
    title: "Ваш темп",
    description:
      "Вы сами выбираете формат: пробные, интенсив на 4 недели или гибкий абонемент с возможностью заморозки.",
    icon: "lotus",
  },
  {
    title: "Экспертный подход",
    description:
      "Тренеры ДЗЕН — сертифицированные специалисты с практическим опытом и вниманием к технике и безопасности.",
    icon: "teacher",
  },
  {
    title: "Атмосфера внимания",
    description:
      "Мини-группы, чистое пространство и доброжелательная среда, где комфортно начинать и прогрессировать.",
    icon: "zen",
  },
];

export const aboutData: AboutData = {
  title: "Гармония через движение",
  mission:
    "Здоровое тело — это сочетание силы, гибкости и осознанности. Здесь вы сможете выстроить тренировки под свои цели, не разрываясь между разными залами.",
  trialPrice: "Пробное занятие — 450 ₽",
};

export const faqData: FaqItem[] = [
  {
    question: "Нужно ли иметь подготовку для первого занятия?",
    answer:
      "Нет, можно прийти с нулевым опытом. Тренер подберет безопасный уровень нагрузки и варианты упражнений.",
  },
  {
    question: "Сколько человек в группе?",
    answer:
      "Занятия проходят в мини-группах. Групповое занятие проводится от двух человек.",
  },
  {
    question: "Можно ли отменить запись?",
    answer:
      "Да, отмена или перенос записи возможны не менее чем за 2 часа до начала занятия.",
  },
  {
    question: "Можно ли заморозить абонемент?",
    answer:
      "Для абонементов «Гибкость» предусмотрена заморозка до 14 дней в рамках срока действия.",
  },
  {
    question: "Какие направления доступны по абонементу?",
    answer:
      "По абонементам доступны все групповые направления студии, включая йогу, пилатес, растяжку, силовые и танцевальные занятия.",
  },
];

export const benefitsData: BenefitItem[] = [
  {
    title: "Скидка постоянного клиента",
    description:
      "Действует в день пробной/разовой тренировки или в день последнего занятия по старому абонементу.",
  },
  {
    title: "Кэшбэк 3%",
    description:
      "3% от суммы каждого абонемента начисляются на бонусный счет клиента.",
  },
  {
    title: "Оплата баллами",
    description:
      "Списание баллов доступно 2 раза в год: с 20.12 по 20.01 и с 20.06 по 20.07.",
  },
];

export const studioRules: string[] = [
  "Групповое занятие проводится от двух человек.",
  "Отмена или перенос записи возможны не менее чем за 2 часа до начала занятия.",
  "Скидка постоянного клиента действует только в оговоренный период, далее действует полная стоимость.",
];

export const socialLinks: SocialLinks = {
  instagram:
    "https://www.instagram.com/dzen_studio_kazan?igsh=MTZ6NGQ5dTYxMTQwNA==",
  whatsapp: "https://wa.me/message/6PSQGVLAJOEOC1",
  telegram: "https://t.me/Dzen_studio_kazan",
  telegramChannel: "https://t.me/dzenkazan",
};

export const contactData: ContactInfo = {
  phone: "8 (965) 623-33-28",
  address: "г. Казань, ул. Серова, 26",
  social: socialLinks,
};
