import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_SIZE_BYTES,
  savePlayerPhotoFile,
  deleteFile,
  resolvePlayerPhotoPath,
} from "@/lib/upload";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "PLAYER") {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const playerId = session.playerId;
  if (!playerId) {
    return NextResponse.json({ error: "Jucător negăsit." }, { status: 400 });
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

  // Fetch old photo path before saving the new file
  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { photo: true },
  });
  const oldPhotoPath = resolvePlayerPhotoPath(player?.photo ?? null);

  const { filename } = await savePlayerPhotoFile(file, playerId, ext);
  const photoUrl = `/api/player-photo/${playerId}/${filename}`;

  await db.player.update({
    where: { id: playerId },
    data: { photo: photoUrl },
  });

  if (oldPhotoPath) {
    await deleteFile(oldPhotoPath);
  }

  return NextResponse.json({ success: true, photoUrl }, { status: 200 });
}
