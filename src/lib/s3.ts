import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const UPLOAD_PREFIXES = ["directions", "team"] as const;
export type UploadPrefix = (typeof UPLOAD_PREFIXES)[number];

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function s3Config() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  const bucket = process.env.S3_BUCKET;
  const publicUrl = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");

  if (!endpoint || !accessKey || !secretKey || !bucket || !publicUrl) {
    throw new Error("S3 is not configured: S3_ENDPOINT/S3_ACCESS_KEY/S3_SECRET_KEY/S3_BUCKET/S3_PUBLIC_URL");
  }

  return { endpoint, accessKey, secretKey, bucket, publicUrl };
}

const globalForS3 = globalThis as unknown as { s3Client?: S3Client };

function getClient(config: ReturnType<typeof s3Config>): S3Client {
  globalForS3.s3Client ??= new S3Client({
    endpoint: config.endpoint,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  });
  return globalForS3.s3Client;
}

export function s3PublicUrl(key: string): string {
  const { bucket, publicUrl } = s3Config();
  return `${publicUrl}/${bucket}/${key}`;
}

export function extractS3Key(url: string): string | null {
  const { bucket, publicUrl } = s3Config();
  const prefix = `${publicUrl}/${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  try {
    return decodeURIComponent(url.slice(prefix.length).split("?")[0]);
  } catch {
    return null;
  }
}

export async function uploadImage(
  buffer: Buffer,
  contentType: string,
  prefix: UploadPrefix
): Promise<string> {
  const config = s3Config();
  const client = getClient(config);

  const ext =
    contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
  const key = `content/${prefix}/${randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return s3PublicUrl(key);
}

export async function deleteS3Urls(urls: string[]): Promise<number> {
  if (urls.length === 0) return 0;

  const config = s3Config();
  const client = getClient(config);

  let deleted = 0;
  for (const url of urls) {
    const key = extractS3Key(url);
    if (!key) continue;
    try {
      await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
      deleted += 1;
    } catch (e) {
      console.error(`s3: failed to delete ${key}:`, e instanceof Error ? e.message : e);
    }
  }
  return deleted;
}
