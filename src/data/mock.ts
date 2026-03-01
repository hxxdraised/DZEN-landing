export interface NavItem {
  label: string;
  href: string;
}

export interface HeroData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
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
  name: "DZEN",
  description: "Пространство для осознанной жизни и развития",
  navigation: [
    { label: "Главная", href: "/" },
    { label: "О нас", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Контакты", href: "/contacts" },
  ],
  footer: {
    copyright: `© ${new Date().getFullYear()} DZEN. Все права защищены.`,
    links: [
      { label: "Политика конфиденциальности", href: "#" },
      { label: "Условия использования", href: "#" },
    ],
  },
};

export const heroData: HeroData = {
  title: "Найдите свой путь к гармонии",
  subtitle:
    "DZEN — это пространство, где технологии встречаются с осознанностью. Мы помогаем вам достичь баланса в цифровом мире.",
  ctaText: "Узнать больше",
  ctaHref: "/about",
};

export const featuresData: Feature[] = [
  {
    title: "Осознанный подход",
    description:
      "Каждое решение принимается с полным пониманием его влияния на пользователя и окружающий мир.",
    icon: "brain",
  },
  {
    title: "Простота и ясность",
    description:
      "Мы убираем лишнее, оставляя только то, что действительно важно для вашего развития.",
    icon: "sparkles",
  },
  {
    title: "Сообщество единомышленников",
    description:
      "Присоединяйтесь к людям, которые стремятся к балансу между технологиями и реальной жизнью.",
    icon: "users",
  },
  {
    title: "Персональный путь",
    description:
      "Каждый человек уникален — наши инструменты адаптируются под ваши потребности и цели.",
    icon: "compass",
  },
];

export const aboutData = {
  title: "О проекте DZEN",
  description:
    "DZEN создан командой энтузиастов, которые верят в силу осознанного использования технологий. Наша миссия — помочь людям найти баланс в цифровую эпоху.",
  mission:
    "Мы стремимся создать пространство, где каждый может замедлиться, осмыслить свои цели и двигаться к ним с ясным намерением.",
};

export const teamData: TeamMember[] = [
  {
    name: "Алексей Смирнов",
    role: "Основатель и CEO",
    bio: "10+ лет в IT, практикующий медитатор. Верит, что технологии должны служить человеку, а не наоборот.",
  },
  {
    name: "Мария Волкова",
    role: "Head of Design",
    bio: "Дизайнер с фокусом на UX и доступность. Создает интерфейсы, которые не отвлекают, а помогают.",
  },
  {
    name: "Дмитрий Козлов",
    role: "Lead Developer",
    bio: "Full-stack разработчик, приверженец чистого кода и минималистичных решений.",
  },
];

export const faqData: FaqItem[] = [
  {
    question: "Что такое DZEN?",
    answer:
      "DZEN — это платформа и сообщество для людей, которые хотят использовать технологии осознанно. Мы предлагаем инструменты и практики для достижения цифрового баланса.",
  },
  {
    question: "Для кого подходит DZEN?",
    answer:
      "Для всех, кто чувствует, что технологии начинают управлять их жизнью, а не наоборот. Наши решения подходят как для новичков, так и для продвинутых пользователей.",
  },
  {
    question: "Сколько это стоит?",
    answer:
      "Базовые инструменты доступны бесплатно. Премиум-функции и персональное сопровождение доступны по подписке.",
  },
  {
    question: "Как начать?",
    answer:
      "Просто зарегистрируйтесь на платформе и пройдите вводный курс. Это займет не более 10 минут.",
  },
  {
    question: "Есть ли мобильное приложение?",
    answer:
      "Да, наше приложение доступно для iOS и Android. Оно работает и в офлайн-режиме.",
  },
];

export const contactData: ContactInfo = {
  email: "hello@dzen.example.com",
  phone: "+7 (999) 123-45-67",
  address: "Москва, ул. Примерная, д. 1, офис 42",
};
