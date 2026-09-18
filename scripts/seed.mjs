import { readFileSync } from "node:fs";
import { scryptSync, randomBytes } from "node:crypto";
import pg from "pg";

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, "utf8");
    const env = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return env;
  } catch {
    return {};
  }
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

const DEFAULT_NOTIFY_TEMPLATE = [
  "🆕 <b>Заявка с сайта</b>",
  "",
  "👤 <b>{{name}}</b>",
  '📞 <a href="{{phone_link}}">{{phone}}</a>',
  "💬 Предпочитает: <b>{{method}}</b>",
  "{{message_line}}",
  "📍 Источник: {{source}}",
  "🕐 {{datetime}} МСК",
].join("\n");

const DIRECTION_CATEGORIES = [
  {
    title: "Растяжка и мобильность",
    directions: [
      {
        title: "Stretching (классическая растяжка)",
        description:
          "Глубокая проработка мышц, связок и суставов для увеличения гибкости, снятия напряжения и улучшения подвижности суставов.",
      },
      {
        title: "Aero Stretching (гамаки)",
        description:
          "Растяжка с использованием гамаков, которая снимает компрессию с позвоночника, расслабляет и дарит ощущение невесомости.",
      },
      {
        title: "Power Stretching",
        description:
          "Динамичный формат, сочетающий силовые элементы и глубокую растяжку для одновременного развития гибкости и тонуса.",
      },
    ],
  },
  {
    title: "Сила и тонус",
    directions: [
      {
        title: "Пилатес",
        description:
          "Система упражнений для укрепления мышечного корсета, улучшения осанки и развития контроля над телом.",
      },
      {
        title: "Аэропилатес",
        description:
          "Пилатес в воздухе. Гамак усложняет привычные упражнения за счет нестабильности, задействуя больше мышц-стабилизаторов.",
      },
      {
        title: "Функциональный тренинг (функционал)",
        description:
          "Кардиотренировка с использованием дополнительного инвентаря для развития координации и силы.",
      },
      {
        title: "Power Training",
        description:
          "Интенсивные силовые занятия с использованием дополнительного инвентаря для развития мышечной силы и выносливости.",
      },
      {
        title: "3D ягодицы + пресс",
        description: "Локальная проработка мышц кора и ягодиц для создания рельефа.",
      },
    ],
  },
  {
    title: "Йога и осознанность",
    directions: [
      {
        title: "Хатха-йога",
        description:
          "Базовая практика, объединяющая асаны (позы), пранаяму (дыхание) и медитацию для достижения гармонии.",
      },
      {
        title: "Йога «Здоровая спина»",
        description:
          "Практика, сфокусированная на укреплении мышечного корсета спины, снятии болей и формировании правильной осанки.",
      },
      {
        title: "Кундалини-йога",
        description:
          "Энергетическая практика, сочетающая динамические упражнения, дыхание, мантры и медитацию для раскрытия внутреннего потенциала.",
      },
      {
        title: "Йога (мужская группа)",
        description:
          "Функциональная практика для развития мобильности, укрепления спины и снятия напряжения.",
      },
    ],
  },
  {
    title: "Движение и экспрессия",
    directions: [
      {
        title: "High Heels",
        description:
          "Танцевальный класс на каблуках (или в носочках), развивающий грацию, пластику, уверенность в себе и чувство ритма.",
      },
      {
        title: "Фитнес-танцы",
        description:
          "Энергичные танцевальные комбинации под современную музыку для кардионагрузки, координации и отличного настроения.",
      },
    ],
  },
];

const TEAM = [
  {
    name: "Айсылу Абдуллина",
    role: "Основатель студии",
    groupSpecializations: ["Йога «Здоровая спина»", "Йога (мужская группа)"],
    personalSpecializations: ["Индивидуальные занятия", "Хатха-йога", "Пилатес", "Stretching"],
    philosophy:
      "«Гармоничное тело — это баланс силы, гибкости и мобильности. Моя цель — дать вам ощутимый результат, который изменит качество жизни»",
    experience:
      "Основатель студии DZEN с опытом более 8 лет. Специализируется на персональных тренировках и осознанной работе с дыханием и микродвижениями.",
    education: [
      "FPA (стретчинг, анатомия, диастаз)",
      "Институт традиционных методов оздоровления (йогатерапия)",
      "Инструктор адаптивной йоги (Йогамед)",
      "Pilates (Pole Star Pilates, МФР Body Balance)",
      "Курсы: восстановление после родов, здоровая спина, работа со сколиозом и ТБС",
    ],
  },
  {
    name: "Елена Ионина",
    role: "Тренер",
    groupSpecializations: [
      "Pilates",
      "Aero Pilates",
      "Stretching",
      "Aero Stretching",
      "Power Training",
      "Функциональный тренинг",
    ],
    personalSpecializations: ["Персональные тренировки по силовым и мобильности"],
    philosophy:
      "«Спорт — это не цель, а глубокий диалог с собой и с миром. Настоящий наставник учит ощущать жизнь в каждом движении»",
    experience:
      "Тренер с 9-летним стажем и спортивным прошлым (КМС по художественной гимнастике). Формирует драйвовую атмосферу и устойчивую мотивацию.",
    education: [
      "Профессиональная переподготовка («НАДПО»)",
      "Диплом фитнес-тренера («Петерскиллс»)",
      "Пилатес («Школа Эвотрен»)",
      "Сертификаты HLS GO, FSA, ExpertX, Anatomystudy, Fly Yoga, Anatomica",
    ],
  },
  {
    name: "Анна Мартышина",
    role: "Тренер",
    groupSpecializations: [
      "Stretching",
      "High Heels",
      "Фитнес-танцы",
      "Йога «Здоровая спина»",
      "Aero Stretching",
    ],
    personalSpecializations: ["Персональные по растяжке и танцевальному движению"],
    philosophy:
      "«В неустойчивом мире находим опору в себе и в своем теле. Движение — выражение женственности и внутренней силы»",
    experience:
      "Проводит занятия как практику самопознания и раскрепощения: гибкость, спина, уверенность и контакт с телом.",
    education: [
      "Сертифицированный тренер групповых программ по стретчингу",
      "Силовой тренинг (Homo Fitness)",
      "Курсы по профилактике травм плеча и позвоночника, женскому здоровью",
      "Многолетний танцевальный опыт (мастер-классы, интенсивы)",
    ],
  },
  {
    name: "Анастасия Иванова",
    role: "Тренер",
    groupSpecializations: ["Йога «Здоровая спина»", "Йога (мужская группа)", "Хатха-йога"],
    personalSpecializations: ["Женское здоровье"],
    philosophy: "«Верю, что через практику йоги можно достичь гармонии в жизни»",
    experience:
      "Сертифицированный инструктор с двухлетним опытом. Сочетает динамику, укрепление мышечного корсета и травмобезопасную технику.",
    education: ["Академия Йоги", "Федерация йоги России", "Yoga Alliance, YTTC 200"],
  },
  {
    name: "Полина Родина",
    role: "Тренер",
    groupSpecializations: [
      "Кундалини-йога",
      "Хатха-йога",
      "Аэройога",
      "Йога «Здоровая спина»",
      "Пилатес",
    ],
    personalSpecializations: ["Персональные занятия по йоге и пилатесу"],
    philosophy:
      "«Истинная практика начинается с намерения. Мое — чтобы каждый обрел гармонию, свободу движения и внутренний рост»",
    experience:
      "Более 13 лет практики. Создает среду для глубокого физического и внутреннего развития.",
    education: [
      "Сертифицированный инструктор хатха-йоги (Федерация Йоги РФ, Москва)",
      "Мастер Рейки (Braham Yoga, Индия)",
    ],
  },
  {
    name: "Наиль Шарафиев",
    role: "Тренер",
    groupSpecializations: ["3D ягодицы + пресс", "Силовой тренинг"],
    personalSpecializations: ["Персональные по силовой подготовке"],
    philosophy:
      "«Получить тело мечты легче, чем кажется, главное начать. Я помогу пройти этот путь эффективно и без травм»",
    experience:
      "Действующий спортсмен-чемпион с тренерским стажем более 10 лет. Делает упор на биомеханику и техничный результат.",
    education: [
      "Мастер спорта международного класса по пауэрлифтингу",
      "Чемпион мира, рекордсмен России",
      "Сертифицированный тренер тренажерного зала (Москва)",
    ],
  },
  {
    name: "Ирина Горбунова",
    role: "Тренер",
    groupSpecializations: ["Хатха-йога", "Аэройога", "Йога «Здоровая спина»", "Йога для беременных"],
    personalSpecializations: ["Женское здоровье"],
    philosophy:
      "«Йога — это образ жизни, наполняющий тело энергией, а сердце — гармонией и радостью»",
    experience:
      "Сертифицированный преподаватель с 10-летним опытом. Сильная практика асан и дыхания для восстановления баланса тела и ума.",
    education: [
      "Сертифицированный инструктор фитнес-йоги",
      "Йогатерапия и адаптивная физкультура (Санкт-Петербургский Институт Йогатерапии)",
    ],
  },
];

const PRICING = [
  {
    title: "Начните со знакомства",
    subtitle:
      "Идеальный старт для новичков. Познакомьтесь со студией, тренерами и разными направлениями, чтобы найти свое.",
    note: null,
    plans: [
      {
        name: "Пробный визит",
        label: null,
        details: "Одно занятие на любом направлении",
        audience: "Хочу попробовать разово",
        duration: null,
        fullPrice: 450,
        discountPrice: null,
        ctaText: "Записаться",
      },
      {
        name: "Пакет знакомства",
        label: null,
        details: "Абонемент на 3 пробных занятия: 3 разных направления на ваш выбор",
        audience: "Хочу выбрать «свое» направление",
        duration: "14 дней",
        fullPrice: 1800,
        discountPrice: null,
        ctaText: "Записаться",
      },
    ],
  },
  {
    title: "Для ситуативных визитов",
    subtitle: "Если у вас нерегулярный график или вы хотите посетить конкретное занятие",
    note: null,
    plans: [
      {
        name: "Разовое занятие",
        label: null,
        details: "Любое групповое направление",
        audience: null,
        duration: null,
        fullPrice: 950,
        discountPrice: null,
        ctaText: "Купить",
      },
    ],
  },
  {
    title: "Для быстрого результата и дисциплины",
    subtitle:
      "Интенсивный ритм на 4 недели. Идеально, чтобы сформировать привычку и увидеть первые изменения.",
    note: "Активируется в течение 14 дней с момента оплаты при первом посещении. Автоматическая активация на 15-й день после оплаты. *Скидка действительна только в день пробного занятия/разового посещения и до дня последнего занятия по абонементу.",
    plans: [
      {
        name: "Старт",
        label: "4 занятия",
        details: "Интенсив на 4 недели",
        audience: null,
        duration: "4 недели",
        fullPrice: 3300,
        discountPrice: 3000,
        ctaText: "Купить",
      },
      {
        name: "Тонус",
        label: "6 занятий",
        details: "Оптимальный объем на месяц",
        audience: null,
        duration: "4 недели",
        fullPrice: 4600,
        discountPrice: 4200,
        ctaText: "Купить",
      },
      {
        name: "Безлимит",
        label: "Безлимит",
        details: "Максимум посещений за период",
        audience: null,
        duration: "4 недели",
        fullPrice: 8500,
        discountPrice: 7500,
        ctaText: "Купить",
      },
    ],
  },
  {
    title: "Для вашего комфортного темпа",
    subtitle:
      "Абонемент подстраивается под ваш график. Срок равен количеству занятий в неделях + заморозка до 14 дней.",
    note: "Активируется в течение 60 дней с момента оплаты при первом посещении либо автоматически по истечении 60 дней. *Скидка действительна только в день пробного занятия/разового посещения и до дня последнего занятия по абонементу.",
    plans: [
      {
        name: "Свобода",
        label: "8 занятий",
        details: null,
        audience: "Для регулярных тренировок в своем ритме",
        duration: "8 недель + заморозка 14 дней",
        fullPrice: 5600,
        discountPrice: 5200,
        ctaText: "Купить",
      },
      {
        name: "Баланс",
        label: "12 занятий",
        details: null,
        audience: "Идеальный баланс по частоте и выгоде",
        duration: "12 недель + заморозка 14 дней",
        fullPrice: 7200,
        discountPrice: 6800,
        ctaText: "Купить",
      },
      {
        name: "Трансформация",
        label: "24 занятия",
        details: null,
        audience: "Оптимальный пакет для видимых изменений",
        duration: "24 недели (полгода) + заморозка 14 дней",
        fullPrice: 14500,
        discountPrice: 13500,
        ctaText: "Купить",
      },
      {
        name: "Профи",
        label: "50 занятий",
        details: null,
        audience: "Максимальная выгода для постоянных клиентов",
        duration: "50 недель (1 год) + заморозка 14 дней",
        fullPrice: 27000,
        discountPrice: 26500,
        ctaText: "Купить",
      },
    ],
  },
  {
    title: "Персональный подход",
    subtitle:
      "Индивидуальная программа и полное внимание тренера для достижения ваших целей.",
    note: "Возможны корпоративные тренировки (уточняйте у администратора). Срок действия абонементов отсчитывается с даты активации первым занятием.",
    plans: [
      {
        name: "Йога и пилатес — пробное",
        label: null,
        details: "Персональный формат",
        audience: null,
        duration: null,
        fullPrice: 2000,
        discountPrice: null,
        ctaText: "Записаться",
      },
      {
        name: "Йога и пилатес — разовое",
        label: null,
        details: "Персональный формат",
        audience: null,
        duration: null,
        fullPrice: 2600,
        discountPrice: null,
        ctaText: "Записаться",
      },
      {
        name: "Йога и пилатес — 4 занятия",
        label: null,
        details: "Индивидуальный абонемент",
        audience: null,
        duration: "4 недели",
        fullPrice: 9900,
        discountPrice: null,
        ctaText: "Выбрать",
      },
      {
        name: "Йога и пилатес — 8 занятий",
        label: null,
        details: "Индивидуальный абонемент",
        audience: null,
        duration: "8 недель",
        fullPrice: 18400,
        discountPrice: null,
        ctaText: "Выбрать",
      },
      {
        name: "Растяжка/силовые/танцы — разовое",
        label: null,
        details: "Персональный формат",
        audience: null,
        duration: null,
        fullPrice: 2000,
        discountPrice: null,
        ctaText: "Записаться",
      },
      {
        name: "Растяжка/силовые/танцы — 4 занятия",
        label: null,
        details: "Индивидуальный абонемент",
        audience: null,
        duration: "4 недели",
        fullPrice: 7400,
        discountPrice: null,
        ctaText: "Выбрать",
      },
      {
        name: "Растяжка/силовые/танцы — 8 занятий",
        label: null,
        details: "Индивидуальный абонемент",
        audience: null,
        duration: "8 недель",
        fullPrice: 14000,
        discountPrice: null,
        ctaText: "Выбрать",
      },
      {
        name: "Парная тренировка — разовое",
        label: null,
        details: "Цена за тренировку для двоих",
        audience: null,
        duration: null,
        fullPrice: 3000,
        discountPrice: null,
        ctaText: "Записаться",
      },
      {
        name: "Парная тренировка — 4 занятия",
        label: null,
        details: "Цена за двоих",
        audience: null,
        duration: "4 недели",
        fullPrice: 11200,
        discountPrice: null,
        ctaText: "Выбрать",
      },
      {
        name: "Парная тренировка — 8 занятий",
        label: null,
        details: "Цена за двоих",
        audience: null,
        duration: "8 недель",
        fullPrice: 20800,
        discountPrice: null,
        ctaText: "Выбрать",
      },
    ],
  },
];

const fileEnv = loadEnvFile(".env.local");
const env = { ...fileEnv, ...process.env };

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set (.env.local or environment)");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id bigserial PRIMARY KEY,
      login text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key text PRIMARY KEY,
      value text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS listok_tokens (
      id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      access_token text NOT NULL,
      refresh_token text NOT NULL,
      expires_at bigint,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id bigserial PRIMARY KEY,
      name text NOT NULL,
      phone text NOT NULL,
      contact_method text NOT NULL,
      message text,
      source text NOT NULL,
      consent boolean NOT NULL,
      ip text,
      telegram_delivered boolean NOT NULL DEFAULT false,
      telegram_error text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS direction_categories (
      id bigserial PRIMARY KEY,
      title text NOT NULL,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS directions (
      id bigserial PRIMARY KEY,
      category_id bigint NOT NULL REFERENCES direction_categories(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text NOT NULL,
      photo_url text,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id bigserial PRIMARY KEY,
      name text NOT NULL,
      role text NOT NULL,
      group_specializations jsonb NOT NULL DEFAULT '[]',
      personal_specializations jsonb NOT NULL DEFAULT '[]',
      philosophy text NOT NULL,
      experience text NOT NULL,
      education jsonb NOT NULL DEFAULT '[]',
      photo_url text,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pricing_blocks (
      id bigserial PRIMARY KEY,
      title text NOT NULL,
      subtitle text,
      note text,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id bigserial PRIMARY KEY,
      block_id bigint NOT NULL REFERENCES pricing_blocks(id) ON DELETE CASCADE,
      name text NOT NULL,
      label text,
      details text,
      audience text,
      duration text,
      full_price int NOT NULL,
      discount_price int,
      cta_text text NOT NULL,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function seedAdmin() {
  if (env.ADMIN_LOGIN && env.ADMIN_PASSWORD) {
    const existing = await pool.query("SELECT id FROM admin_users LIMIT 1");
    if ((existing.rowCount ?? 0) === 0) {
      await pool.query("INSERT INTO admin_users (login, password_hash) VALUES ($1, $2)", [
        env.ADMIN_LOGIN,
        hashPassword(env.ADMIN_PASSWORD),
      ]);
      console.log(`admin user created: ${env.ADMIN_LOGIN}`);
    } else {
      console.log("admin user already exists, skipped");
    }
  } else {
    console.log("ADMIN_LOGIN/ADMIN_PASSWORD not set, admin creation skipped");
  }
}

async function seedSettings() {
  const template = await pool.query(
    "SELECT value FROM settings WHERE key = 'telegram.notify_template'"
  );
  if ((template.rowCount ?? 0) === 0) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('telegram.notify_template', $1)
       ON CONFLICT (key) DO NOTHING`,
      [DEFAULT_NOTIFY_TEMPLATE]
    );
    console.log("default telegram.notify_template seeded");
  } else {
    console.log("telegram.notify_template already set, skipped");
  }
}

async function seedDirections() {
  const existing = await pool.query("SELECT id FROM direction_categories LIMIT 1");
  if ((existing.rowCount ?? 0) > 0) {
    console.log("directions already seeded, skipped");
    return;
  }
  for (const [ci, category] of DIRECTION_CATEGORIES.entries()) {
    const inserted = await pool.query(
      "INSERT INTO direction_categories (title, sort_order) VALUES ($1, $2) RETURNING id",
      [category.title, ci]
    );
    const categoryId = inserted.rows[0].id;
    for (const [di, direction] of category.directions.entries()) {
      await pool.query(
        "INSERT INTO directions (category_id, title, description, sort_order) VALUES ($1, $2, $3, $4)",
        [categoryId, direction.title, direction.description, di]
      );
    }
  }
  console.log(`directions seeded: ${DIRECTION_CATEGORIES.length} categories`);
}

async function seedTeam() {
  const existing = await pool.query("SELECT id FROM team_members LIMIT 1");
  if ((existing.rowCount ?? 0) > 0) {
    console.log("team already seeded, skipped");
    return;
  }
  for (const [i, member] of TEAM.entries()) {
    await pool.query(
      `INSERT INTO team_members
        (name, role, group_specializations, personal_specializations, philosophy, experience, education, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        member.name,
        member.role,
        JSON.stringify(member.groupSpecializations),
        JSON.stringify(member.personalSpecializations),
        member.philosophy,
        member.experience,
        JSON.stringify(member.education),
        i,
      ]
    );
  }
  console.log(`team seeded: ${TEAM.length} members`);
}

async function seedPricing() {
  const existing = await pool.query("SELECT id FROM pricing_blocks LIMIT 1");
  if ((existing.rowCount ?? 0) > 0) {
    console.log("pricing already seeded, skipped");
    return;
  }
  for (const [bi, block] of PRICING.entries()) {
    const inserted = await pool.query(
      "INSERT INTO pricing_blocks (title, subtitle, note, sort_order) VALUES ($1, $2, $3, $4) RETURNING id",
      [block.title, block.subtitle, block.note, bi]
    );
    const blockId = inserted.rows[0].id;
    for (const [pi, plan] of block.plans.entries()) {
      await pool.query(
        `INSERT INTO pricing_plans
          (block_id, name, label, details, audience, duration, full_price, discount_price, cta_text, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          blockId,
          plan.name,
          plan.label,
          plan.details,
          plan.audience,
          plan.duration,
          plan.fullPrice,
          plan.discountPrice,
          plan.ctaText,
          pi,
        ]
      );
    }
  }
  console.log(`pricing seeded: ${PRICING.length} blocks`);
}

async function main() {
  await ensureTables();
  await seedAdmin();
  await seedSettings();
  await seedDirections();
  await seedTeam();
  await seedPricing();
  console.log("seed complete");
}

main()
  .catch((e) => {
    console.error("seed failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
