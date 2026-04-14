import { join } from "path";
import { writeFile, mkdir, unlink, rm } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.ms-word": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

/**
 * Extension-based fallback map for browsers that report a generic MIME type
 * (e.g. application/octet-stream) for .doc / .docx files.
 * Built from the values of ALLOWED_TYPES so both maps share a single source of truth.
 * "jpeg" is added as an extra alias that normalises to "jpg".
 */
export const ALLOWED_EXTENSIONS: Record<string, string> = {
  // Derive from ALLOWED_TYPES values: each unique extension maps to itself.
  ...Object.fromEntries(Object.values(ALLOWED_TYPES).map((ext) => [ext, ext])),
  // Extra alias: browsers / OS may use .jpeg instead of .jpg.
  jpeg: "jpg",
};

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

export const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Resolves the allowed file extension from the file's MIME type, falling back to the
 * file's extension when the browser reports a generic MIME type (e.g. application/octet-stream).
 * Uses lastIndexOf so "document.pdf.exe" correctly resolves to "exe" (rejected).
 * Returns undefined when neither check passes.
 */
export function resolveAllowedExt(file: File): string | undefined {
  const byMime = ALLOWED_TYPES[file.type];
  if (byMime) return byMime;

  const nameLower = file.name.toLowerCase();
  const dotIdx = nameLower.lastIndexOf(".");
  if (dotIdx !== -1) {
    const rawExt = nameLower.slice(dotIdx + 1);
    return ALLOWED_EXTENSIONS[rawExt];
  }
  return undefined;
}

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

/**
 * Deletes a single file at `filePath` from the filesystem, ignoring errors
 * (e.g. file already deleted or path does not exist).
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // Ignore – file may have already been deleted
  }
}

/**
 * Deletes the entire upload directory for a mentor and all files within it.
 * Used when a mentor is deleted.
 */
export async function deleteMentorUploadDir(mentorId: number): Promise<void> {
  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  const mentorDir = join(uploadDir, String(mentorId));
  try {
    await rm(mentorDir, { recursive: true, force: true });
  } catch {
    // Ignore – directory may not exist
  }
}

/**
 * Extracts the filesystem path for a mentor photo stored by this application.
 * Returns null when `photoUrl` is a plain URL pointing elsewhere.
 */
export function resolveMentorPhotoPath(
  photoUrl: string | null
): string | null {
  if (!photoUrl) return null;
  // Local photos have the format /api/mentor-photo/{mentorId}/{filename}
  const prefix = "/api/mentor-photo/";
  if (!photoUrl.startsWith(prefix)) return null;
  const rest = photoUrl.slice(prefix.length); // "{mentorId}/{filename}"
  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  return join(uploadDir, rest);
}

export async function savePlayerPhotoFile(
  file: File,
  playerId: number,
  ext: string
): Promise<{ filePath: string; filename: string }> {
  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  const playerDir = join(uploadDir, "players", String(playerId));
  await mkdir(playerDir, { recursive: true });

  const filename = `${uuidv4()}.${ext}`;
  const filePath = join(playerDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return { filePath, filename };
}

/**
 * Extracts the filesystem path for a player photo stored by this application.
 * Returns null when `photoUrl` is not a local application photo.
 */
export function resolvePlayerPhotoPath(
  photoUrl: string | null
): string | null {
  if (!photoUrl) return null;
  // Local photos have the format /api/player-photo/{playerId}/{filename}
  const prefix = "/api/player-photo/";
  if (!photoUrl.startsWith(prefix)) return null;
  const rest = photoUrl.slice(prefix.length); // "{playerId}/{filename}"
  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  return join(uploadDir, "players", rest);
}
