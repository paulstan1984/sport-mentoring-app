import { requireSuperAdmin } from "@/lib/auth";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function GET() {
  await requireSuperAdmin();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  // Strip the "file://" or "file:" prefix to get the actual filesystem path
  const filePath = databaseUrl.replace(/^file:(\/\/)?/, "");

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(filePath);
  } catch {
    return NextResponse.json({ error: "Fișierul bazei de date nu a putut fi citit." }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="app.db"',
      "Content-Length": String(fileBuffer.length),
    },
  });
}
