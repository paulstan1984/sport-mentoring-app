import { type NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import { join } from "path";
import { getSession } from "@/lib/auth";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const { path } = await params;
  if (!path || path.length < 2) {
    return NextResponse.json({ error: "Resursă negăsită." }, { status: 404 });
  }

  const [playerIdStr, filename] = path;
  const playerId = Number(playerIdStr);

  if (!playerId || !filename) {
    return NextResponse.json({ error: "Resursă negăsită." }, { status: 404 });
  }

  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return NextResponse.json({ error: "Resursă negăsită." }, { status: 404 });
  }

  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  const filePath = join(uploadDir, "players", String(playerId), filename);

  let stat: ReturnType<typeof statSync>;
  try {
    stat = statSync(filePath);
  } catch {
    return NextResponse.json({ error: "Fișierul nu a fost găsit pe server." }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
