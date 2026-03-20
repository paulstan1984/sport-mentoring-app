import { type NextRequest, NextResponse } from "next/server";
import { join, extname } from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "MENTOR") {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const mentorId = session.mentorId;
  if (!mentorId) {
    return NextResponse.json({ error: "Mentor negăsit." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formular invalid." }, { status: 400 });
  }

  const name = (formData.get("name") as string)?.trim();
  const file = formData.get("file") as File | null;

  if (!name || !file) {
    return NextResponse.json({ error: "Completați toate câmpurile." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fișierul depășește 20 MB." }, { status: 400 });
  }

  const mimeType = file.type;
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    return NextResponse.json(
      { error: "Tip de fișier neacceptat. Acceptăm PDF, DOC, DOCX, JPG, PNG, GIF." },
      { status: 400 }
    );
  }

  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  const mentorDir = join(uploadDir, String(mentorId));
  await mkdir(mentorDir, { recursive: true });

  const filename = `${uuidv4()}.${ext}`;
  const filePath = join(mentorDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  await db.libraryItem.create({
    data: {
      mentorId,
      name,
      filePath,
      fileType: ext,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
