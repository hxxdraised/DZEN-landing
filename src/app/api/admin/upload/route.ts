import { NextResponse, type NextRequest } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  UPLOAD_PREFIXES,
  uploadImage,
  type UploadPrefix,
} from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!sessionFromRequest(request)) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const file = form.get("file");
  const prefix = form.get("prefix");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (typeof prefix !== "string" || !UPLOAD_PREFIXES.includes(prefix as UploadPrefix)) {
    return NextResponse.json({ error: "Некорректный тип загрузки" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return NextResponse.json(
      { error: "Допустимы изображения JPEG, PNG или WebP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Файл больше 5 МБ" }, { status: 400 });
  }

  let url: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    url = await uploadImage(buffer, file.type, prefix as UploadPrefix);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка хранилища";
    return NextResponse.json({ error: `Не удалось загрузить файл: ${message}` }, { status: 502 });
  }

  return NextResponse.json({ url });
}
