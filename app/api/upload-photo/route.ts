import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_SIZE_BYTES,
  saveUploadedFile,
  deleteFile,
  resolveMentorPhotoPath,
} from "@/lib/upload";

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

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Fișierul lipsește." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fișierul depășește 20 MB." }, { status: 400 });
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Tip de fișier neacceptat. Acceptăm JPG, PNG, GIF." },
      { status: 400 }
    );
  }

  const { filename } = await saveUploadedFile(file, mentorId, ext);
  const photoUrl = `/api/mentor-photo/${mentorId}/${filename}`;

  // Delete the old photo file before updating the record
  const mentor = await db.mentor.findUnique({
    where: { id: mentorId },
    select: { photo: true },
  });
  const oldPhotoPath = resolveMentorPhotoPath(mentor?.photo ?? null);

  await db.mentor.update({
    where: { id: mentorId },
    data: { photo: photoUrl },
  });

  if (oldPhotoPath) {
    await deleteFile(oldPhotoPath);
  }

  return NextResponse.json({ success: true, photoUrl }, { status: 200 });
}
