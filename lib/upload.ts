import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

export const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function saveUploadedFile(
  file: File,
  mentorId: number,
  ext: string
): Promise<{ filePath: string; filename: string }> {
  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  const mentorDir = join(uploadDir, String(mentorId));
  await mkdir(mentorDir, { recursive: true });

  const filename = `${uuidv4()}.${ext}`;
  const filePath = join(mentorDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return { filePath, filename };
}
