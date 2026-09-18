import { unstable_cache } from "next/cache";
import { query } from "@/lib/db";

export interface DirectionContent {
  id: number;
  title: string;
  description: string;
  photoUrl: string | null;
}

export interface DirectionCategoryContent {
  id: number;
  title: string;
  directions: DirectionContent[];
}

export interface TeamMemberContent {
  id: number;
  name: string;
  role: string;
  groupSpecializations: string[];
  personalSpecializations: string[];
  philosophy: string;
  experience: string;
  education: string[];
  photoUrl: string | null;
}

export interface PricingPlanContent {
  id: number;
  name: string;
  label: string | null;
  details: string | null;
  audience: string | null;
  duration: string | null;
  fullPrice: number;
  discountPrice: number | null;
  ctaText: string;
}

export interface PricingBlockContent {
  id: number;
  title: string;
  subtitle: string | null;
  note: string | null;
  plans: PricingPlanContent[];
}

export const CONTENT_TAGS = {
  directions: "content:directions",
  team: "content:team",
  pricing: "content:pricing",
} as const;

let contentTablesEnsured: Promise<void> | null = null;

export function ensureTables(): Promise<void> {
  contentTablesEnsured ??= (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS direction_categories (
        id bigserial PRIMARY KEY,
        title text NOT NULL,
        sort_order int NOT NULL DEFAULT 0,
        visible boolean NOT NULL DEFAULT true,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await query(`
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
    await query(`
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
    await query(`
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
    await query(`
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
  })();
  return contentTablesEnsured;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

async function fetchDirections(): Promise<DirectionCategoryContent[]> {
  await ensureTables();
  const categories = await query<{
    id: string;
    title: string;
  }>(
    "SELECT id, title FROM direction_categories WHERE visible = true ORDER BY sort_order, id"
  );
  const directions = await query<{
    id: string;
    category_id: string;
    title: string;
    description: string;
    photo_url: string | null;
  }>(
    "SELECT id, category_id, title, description, photo_url FROM directions WHERE visible = true ORDER BY sort_order, id"
  );

  return categories.rows.map((category) => ({
    id: Number(category.id),
    title: category.title,
    directions: directions.rows
      .filter((d) => d.category_id === category.id)
      .map((d) => ({
        id: Number(d.id),
        title: d.title,
        description: d.description,
        photoUrl: d.photo_url,
      })),
  }));
}

async function fetchTeam(): Promise<TeamMemberContent[]> {
  await ensureTables();
  const members = await query<{
    id: string;
    name: string;
    role: string;
    group_specializations: unknown;
    personal_specializations: unknown;
    philosophy: string;
    experience: string;
    education: unknown;
    photo_url: string | null;
  }>(
    `SELECT id, name, role, group_specializations, personal_specializations,
            philosophy, experience, education, photo_url
     FROM team_members WHERE visible = true ORDER BY sort_order, id`
  );

  return members.rows.map((m) => ({
    id: Number(m.id),
    name: m.name,
    role: m.role,
    groupSpecializations: toStringArray(m.group_specializations),
    personalSpecializations: toStringArray(m.personal_specializations),
    philosophy: m.philosophy,
    experience: m.experience,
    education: toStringArray(m.education),
    photoUrl: m.photo_url,
  }));
}

async function fetchPricing(): Promise<PricingBlockContent[]> {
  await ensureTables();
  const blocks = await query<{
    id: string;
    title: string;
    subtitle: string | null;
    note: string | null;
  }>(
    "SELECT id, title, subtitle, note FROM pricing_blocks WHERE visible = true ORDER BY sort_order, id"
  );
  const plans = await query<{
    id: string;
    block_id: string;
    name: string;
    label: string | null;
    details: string | null;
    audience: string | null;
    duration: string | null;
    full_price: number;
    discount_price: number | null;
    cta_text: string;
  }>(
    `SELECT id, block_id, name, label, details, audience, duration,
            full_price, discount_price, cta_text
     FROM pricing_plans WHERE visible = true ORDER BY sort_order, id`
  );

  return blocks.rows.map((block) => ({
    id: Number(block.id),
    title: block.title,
    subtitle: block.subtitle,
    note: block.note,
    plans: plans.rows
      .filter((p) => p.block_id === block.id)
      .map((p) => ({
        id: Number(p.id),
        name: p.name,
        label: p.label,
        details: p.details,
        audience: p.audience,
        duration: p.duration,
        fullPrice: p.full_price,
        discountPrice: p.discount_price,
        ctaText: p.cta_text,
      })),
  }));
}

export const getDirections = unstable_cache(fetchDirections, ["content-directions"], {
  tags: [CONTENT_TAGS.directions],
  revalidate: 3600,
});

export const getTeam = unstable_cache(fetchTeam, ["content-team"], {
  tags: [CONTENT_TAGS.team],
  revalidate: 3600,
});

export const getPricing = unstable_cache(fetchPricing, ["content-pricing"], {
  tags: [CONTENT_TAGS.pricing],
  revalidate: 3600,
});

export interface AdminDirection {
  id: number;
  title: string;
  description: string;
  photoUrl: string | null;
  sortOrder: number;
  visible: boolean;
}

export interface AdminDirectionCategory {
  id: number;
  title: string;
  sortOrder: number;
  visible: boolean;
  directions: AdminDirection[];
}

export async function getDirectionsAdmin(): Promise<AdminDirectionCategory[]> {
  await ensureTables();
  const categories = await query<{
    id: string;
    title: string;
    sort_order: number;
    visible: boolean;
  }>(
    "SELECT id, title, sort_order, visible FROM direction_categories ORDER BY sort_order, id"
  );
  const directions = await query<{
    id: string;
    category_id: string;
    title: string;
    description: string;
    photo_url: string | null;
    sort_order: number;
    visible: boolean;
  }>(
    `SELECT id, category_id, title, description, photo_url, sort_order, visible
     FROM directions ORDER BY sort_order, id`
  );

  return categories.rows.map((c) => ({
    id: Number(c.id),
    title: c.title,
    sortOrder: c.sort_order,
    visible: c.visible,
    directions: directions.rows
      .filter((d) => d.category_id === c.id)
      .map((d) => ({
        id: Number(d.id),
        title: d.title,
        description: d.description,
        photoUrl: d.photo_url,
        sortOrder: d.sort_order,
        visible: d.visible,
      })),
  }));
}

export async function moveEntity(
  table: "direction_categories" | "directions",
  id: number,
  direction: "up" | "down"
): Promise<void> {
  await ensureTables();
  const ordered = await query<{ id: string; sort_order: number }>(
    `SELECT id, sort_order FROM ${table} ORDER BY sort_order, id`
  );
  const rows = ordered.rows.map((r) => ({ id: Number(r.id), sortOrder: r.sort_order }));
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;

  for (const [i, row] of rows.entries()) {
    if (row.sortOrder !== i) {
      await query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [i, row.id]);
      rows[i].sortOrder = i;
    }
  }

  const a = rows[index];
  const b = rows[target];
  await query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [b.sortOrder, a.id]);
  await query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [a.sortOrder, b.id]);
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
