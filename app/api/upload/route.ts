import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_SIZE_BYTES, resolveAllowedExt, saveUploadedFile } from "@/lib/upload";

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

  const ext = resolveAllowedExt(file);
  if (!ext) {
    return NextResponse.json(
      { error: "Tip de fișier neacceptat. Acceptăm PDF, DOC, DOCX, JPG, PNG, GIF." },
      { status: 400 }
    );
  }

  const { filePath } = await saveUploadedFile(file, mentorId, ext);

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
