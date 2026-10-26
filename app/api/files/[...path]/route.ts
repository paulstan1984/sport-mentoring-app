import { type NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import { basename, join } from "path";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const { path } = await params;

  // path[0] is the libraryItemId
  const libraryItemId = Number(path[0]);
  if (!libraryItemId || isNaN(libraryItemId)) {
    return NextResponse.json({ error: "Resursă negăsită." }, { status: 404 });
  }

  const item = await db.libraryItem.findUnique({ where: { id: libraryItemId } });
  if (!item) {
    return NextResponse.json({ error: "Resursă negăsită." }, { status: 404 });
  }

  // Authorization: mentor owns it OR player belongs to that mentor
  if (session.role === "MENTOR") {
    if (session.mentorId !== item.mentorId) {
      return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
    }
  } else if (session.role === "PLAYER") {
    const player = await db.player.findUnique({ where: { id: session.playerId } });
    if (!player || player.mentorId !== item.mentorId) {
      return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  // Stream the file
  // The stored path may come from another environment (e.g. /data/uploads on
  // production), so fall back to the current UPLOAD_DIR/[mentorId]/[file].
  const candidates = [
    item.filePath,
    join(process.env.UPLOAD_DIR ?? "./uploads", String(item.mentorId), basename(item.filePath)),
  ];
  let filePath = "";
  let stat: ReturnType<typeof statSync> | undefined;
  for (const candidate of candidates) {
    try {
      stat = statSync(candidate);
      filePath = candidate;
      break;
    } catch {
      // try next candidate
    }
  }
  if (!stat) {
    return NextResponse.json({ error: "Fișierul nu a fost găsit pe server." }, { status: 404 });
  }

  const MIME_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
  };

  const contentType = MIME_TYPES[item.fileType] ?? "application/octet-stream";
  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(item.name)}.${item.fileType}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
