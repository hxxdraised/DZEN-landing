import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { CONTENT_TAGS } from "@/lib/content";

export const dynamic = "force-dynamic";

const REVALIDATED_PATHS = ["/", "/directions", "/team", "/pricing"] as const;

function secretsMatch(received: string, expected: string): boolean {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET не задан на сервере" },
      { status: 500 }
    );
  }

  const received = request.headers.get("x-revalidate-secret") ?? "";
  if (!received || !secretsMatch(received, secret)) {
    return NextResponse.json({ error: "Неверный секрет" }, { status: 401 });
  }

  const tags = Object.values(CONTENT_TAGS);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  for (const path of REVALIDATED_PATHS) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, tags, paths: REVALIDATED_PATHS });
}
