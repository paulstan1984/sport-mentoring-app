import { requireSuperAdmin } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await requireSuperAdmin();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const filePath = databaseUrl.replace(/^file:(\/\/)?/, "");

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Fișierul lipsește." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    return NextResponse.json({ error: "Fișierul este gol." }, { status: 400 });
  }

  // Validate SQLite magic header
  const header = Buffer.from(arrayBuffer.slice(0, 16));
  const SQLITE_MAGIC = "SQLite format 3\0";
  if (header.toString("ascii") !== SQLITE_MAGIC) {
    return NextResponse.json(
      { error: "Fișierul nu este o bază de date SQLite validă." },
      { status: 400 }
    );
  }

  try {
    await writeFile(filePath, Buffer.from(arrayBuffer));
  } catch {
    return NextResponse.json(
      { error: "Eroare la scrierea fișierului bazei de date." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
