"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMentor, getSession } from "@/lib/auth";
import { startOfDayUTC } from "@/lib/streak";

const SALT_ROUNDS = 12;
type ActionResult = {
  error?: string;
  success?: boolean;
  summary?: string;
  issues?: string[];
};

const PLAYER_IMPORT_HEADERS = [
  "username",
  "password",
  "name",
  "team",
  "dateOfBirth",
  "playfieldPosition",
] as const;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function isValidDateInput(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getMentorId(): Promise<number> {
  const session = await getSession();
  if (!session.mentorId) throw new Error("Not a mentor");
  return session.mentorId;
}

// ── Players ───────────────────────────────────────────────────────────────────

export async function createPlayer(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();
  const team = (formData.get("team") as string)?.trim() || null;
  const dateOfBirthStr = formData.get("dateOfBirth") as string;
  const positionId = formData.get("playfieldPositionId")
    ? Number(formData.get("playfieldPositionId"))
    : null;

  if (!username || !password || !name) {
    return { error: "Câmpurile obligatorii sunt incomplete." };
  }
  if (password.length < 8) {
    return { error: "Parola trebuie să aibă cel puțin 8 caractere." };
  }

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) return { error: "Utilizatorul există deja." };

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : null;

  await db.user.create({
    data: {
      username,
      passwordHash,
      role: "PLAYER",
      player: {
        create: {
          name,
          team,
          dateOfBirth,
          playfieldPositionId: positionId,
          mentorId,
        },
      },
    },
  });

  revalidatePath("/mentor/players");
  revalidatePath("/mentor/dashboard");
  return { success: true };
}

export async function importPlayersFromCsv(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const file = formData.get("csvFile");
  if (!(file instanceof File)) {
    return { error: "Selectează un fișier CSV." };
  }

  if (file.size === 0) {
    return { error: "Fișierul CSV este gol." };
  }

  const content = (await file.text()).replace(/^\uFEFF/, "");
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rows.length < 2) {
    return {
      error:
        "Fișierul trebuie să conțină antetul și cel puțin un jucător. Descarcă șablonul pentru formatul corect.",
    };
  }

  const headers = parseCsvLine(rows[0]);
  const hasExpectedHeaders =
    headers.length === PLAYER_IMPORT_HEADERS.length &&
    PLAYER_IMPORT_HEADERS.every((header, index) => headers[index] === header);

  if (!hasExpectedHeaders) {
    return {
      error: `Antet invalid. Formatul corect este: ${PLAYER_IMPORT_HEADERS.join(",")}`,
    };
  }

  const dataRows = rows.slice(1).map((line, index) => ({
    lineNumber: index + 2,
    values: parseCsvLine(line),
  }));

  const issues: string[] = [];
  const usernamesInFile = new Set<string>();
  const validRows: Array<{
    username: string;
    password: string;
    name: string;
    team: string | null;
    dateOfBirth: Date | null;
    playfieldPositionId: number | null;
    lineNumber: number;
  }> = [];

  const positions = await db.playfieldPosition.findMany({
    select: { id: true, name: true },
  });
  const positionsByName = new Map(
    positions.map((position) => [position.name.toLowerCase(), position.id])
  );

  for (const row of dataRows) {
    if (row.values.length !== PLAYER_IMPORT_HEADERS.length) {
      issues.push(
        `Linia ${row.lineNumber}: număr invalid de coloane (${row.values.length}/${PLAYER_IMPORT_HEADERS.length}).`
      );
      continue;
    }

    const [usernameRaw, passwordRaw, nameRaw, teamRaw, dateRaw, positionRaw] = row.values;
    const username = usernameRaw.trim();
    const password = passwordRaw;
    const name = nameRaw.trim();
    const team = teamRaw.trim() ? teamRaw.trim() : null;
    const dateValue = dateRaw.trim();
    const positionValue = positionRaw.trim();

    if (!username || !password || !name) {
      issues.push(`Linia ${row.lineNumber}: username, password și name sunt obligatorii.`);
      continue;
    }

    if (password.length < 8) {
      issues.push(`Linia ${row.lineNumber}: parola trebuie să aibă minimum 8 caractere.`);
      continue;
    }

    if (usernamesInFile.has(username)) {
      issues.push(`Linia ${row.lineNumber}: username duplicat în fișier (${username}).`);
      continue;
    }
    usernamesInFile.add(username);

    let dateOfBirth: Date | null = null;
    if (dateValue) {
      if (!isValidDateInput(dateValue)) {
        issues.push(
          `Linia ${row.lineNumber}: dateOfBirth trebuie să fie în formatul YYYY-MM-DD.`
        );
        continue;
      }
      dateOfBirth = new Date(`${dateValue}T00:00:00.000Z`);
      if (Number.isNaN(dateOfBirth.getTime())) {
        issues.push(`Linia ${row.lineNumber}: dateOfBirth invalid.`);
        continue;
      }
    }

    let playfieldPositionId: number | null = null;
    if (positionValue) {
      const foundPosition = positionsByName.get(positionValue.toLowerCase());
      if (!foundPosition) {
        issues.push(
          `Linia ${row.lineNumber}: poziția "${positionValue}" nu există în sistem.`
        );
        continue;
      }
      playfieldPositionId = foundPosition;
    }

    validRows.push({
      username,
      password,
      name,
      team,
      dateOfBirth,
      playfieldPositionId,
      lineNumber: row.lineNumber,
    });
  }

  if (validRows.length === 0) {
    return {
      error: "Nu există rânduri valide pentru import.",
      issues: issues.slice(0, 10),
    };
  }

  const existingUsers = await db.user.findMany({
    where: { username: { in: validRows.map((row) => row.username) } },
    select: { username: true },
  });
  const existingUsernames = new Set(existingUsers.map((user) => user.username));

  const rowsToCreate: typeof validRows = [];
  for (const row of validRows) {
    if (existingUsernames.has(row.username)) {
      issues.push(`Linia ${row.lineNumber}: username deja existent (${row.username}).`);
      continue;
    }
    rowsToCreate.push(row);
  }

  let createdCount = 0;
  for (const row of rowsToCreate) {
    const passwordHash = await bcrypt.hash(row.password, SALT_ROUNDS);
    await db.user.create({
      data: {
        username: row.username,
        passwordHash,
        role: "PLAYER",
        player: {
          create: {
            mentorId,
            name: row.name,
            team: row.team,
            dateOfBirth: row.dateOfBirth,
            playfieldPositionId: row.playfieldPositionId,
          },
        },
      },
    });
    createdCount += 1;
  }

  if (createdCount > 0) {
    revalidatePath("/mentor/players");
    revalidatePath("/mentor/dashboard");
  }

  return {
    success: createdCount > 0,
    summary: `Import finalizat: ${createdCount} adăugați, ${issues.length} respinși.`,
    issues: issues.slice(0, 10),
    ...(createdCount === 0 ? { error: "Niciun jucător nu a fost importat." } : {}),
  };
}

export async function updatePlayer(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const team = (formData.get("team") as string)?.trim() || null;
  const dateOfBirthStr = formData.get("dateOfBirth") as string;
  const positionId = formData.get("playfieldPositionId")
    ? Number(formData.get("playfieldPositionId"))
    : null;

  if (!id || !name) return { error: "Date invalide." };

  // Ensure player belongs to this mentor
  const player = await db.player.findFirst({ where: { id, mentorId } });
  if (!player) return { error: "Jucătorul nu a fost găsit." };

  const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : null;

  await db.player.update({
    where: { id },
    data: { name, team, dateOfBirth, playfieldPositionId: positionId },
  });

  revalidatePath("/mentor/players");
  revalidatePath(`/mentor/players/${id}`);
  return { success: true };
}

export async function deletePlayer(playerId: number): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const player = await db.player.findFirst({ where: { id: playerId, mentorId } });
  if (!player) return { error: "Jucătorul nu a fost găsit." };

  await db.player.delete({ where: { id: playerId } });
  revalidatePath("/mentor/players");
  revalidatePath("/mentor/dashboard");
  return { success: true };
}

export async function resetPlayerPassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const playerId = Number(formData.get("playerId"));
  const newPassword = formData.get("newPassword") as string;

  if (!playerId || !newPassword) return { error: "Date invalide." };
  if (newPassword.length < 8)
    return { error: "Parola trebuie să aibă cel puțin 8 caractere." };

  const player = await db.player.findFirst({
    where: { id: playerId, mentorId },
    include: { user: true },
  });
  if (!player) return { error: "Jucătorul nu a fost găsit." };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.user.update({
    where: { id: player.userId },
    data: { passwordHash },
  });

  return { success: true };
}

// ── Checkin Form ──────────────────────────────────────────────────────────────

export async function addCheckinFormItem(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const label = (formData.get("label") as string)?.trim();
  const allowAdditionalString = formData.get("allowAdditionalString") === "on";

  if (!label) return { error: "Introduceți un label." };

  // Get or create the form for this mentor
  let form = await db.checkinForm.findUnique({ where: { mentorId } });
  if (!form) {
    form = await db.checkinForm.create({ data: { mentorId } });
  }

  const maxOrder = await db.checkinFormItem.aggregate({
    where: { formId: form.id, deletedAt: null },
    _max: { order: true },
  });

  await db.checkinFormItem.create({
    data: {
      formId: form.id,
      label,
      allowAdditionalString,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/mentor/checkin-form");
  return { success: true };
}

export async function updateCheckinFormItem(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const id = Number(formData.get("id"));
  const label = (formData.get("label") as string)?.trim();
  const allowAdditionalString = formData.get("allowAdditionalString") === "on";

  if (!id || !label) return { error: "Date invalide." };

  // Verify ownership
  const item = await db.checkinFormItem.findFirst({
    where: { id, form: { mentorId } },
  });
  if (!item) return { error: "Element negăsit." };

  await db.checkinFormItem.update({
    where: { id },
    data: { label, allowAdditionalString },
  });

  revalidatePath("/mentor/checkin-form");
  return { success: true };
}

export async function softDeleteCheckinFormItem(id: number): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const item = await db.checkinFormItem.findFirst({
    where: { id, form: { mentorId } },
  });
  if (!item) return { error: "Element negăsit." };

  await db.checkinFormItem.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/mentor/checkin-form");
  return { success: true };
}

export async function moveCheckinFormItem(
  id: number,
  direction: "up" | "down"
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const item = await db.checkinFormItem.findFirst({
    where: { id, form: { mentorId }, deletedAt: null },
  });
  if (!item) return { error: "Element negăsit." };

  const sibling = await db.checkinFormItem.findFirst({
    where: {
      formId: item.formId,
      deletedAt: null,
      order: direction === "up" ? { lt: item.order } : { gt: item.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });

  if (!sibling) return { success: true }; // already at edge

  await db.$transaction([
    db.checkinFormItem.update({
      where: { id: item.id },
      data: { order: sibling.order },
    }),
    db.checkinFormItem.update({
      where: { id: sibling.id },
      data: { order: item.order },
    }),
  ]);

  revalidatePath("/mentor/checkin-form");
  return { success: true };
}

// ── Library ───────────────────────────────────────────────────────────────────

export async function deleteLibraryItem(id: number): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const item = await db.libraryItem.findFirst({ where: { id, mentorId } });
  if (!item) return { error: "Element negăsit." };

  // File deletion is handled separately via the API route
  await db.libraryItem.delete({ where: { id } });
  revalidatePath("/mentor/library");
  return { success: true };
}

// ── Daily Message ─────────────────────────────────────────────────────────────

export async function publishDailyMessage(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const message = (formData.get("message") as string)?.trim();
  const plainText = (message ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (!plainText) return { error: "Mesajul nu poate fi gol." };

  const today = startOfDayUTC(new Date());

  await db.dailyMessage.upsert({
    where: { mentorId_day: { mentorId, day: today } },
    update: { message },
    create: { mentorId, message, day: today },
  });

  revalidatePath("/mentor/message");
  revalidatePath("/player/dashboard");
  return { success: true };
}

// ── Mentor Profile ────────────────────────────────────────────────────────────

export async function updateMentorProfile(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const mentorId = await getMentorId();

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const photo = (formData.get("photo") as string)?.trim() || null;

  if (!name) return { error: "Numele este obligatoriu." };

  await db.mentor.update({
    where: { id: mentorId },
    data: { name, description, photo },
  });

  revalidatePath("/mentor/profile");
  return { success: true };
}

export async function changeMentorPassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireMentor();
  const session = await getSession();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) return { error: "Completați toate câmpurile." };
  if (newPassword.length < 8)
    return { error: "Parola nouă trebuie să aibă cel puțin 8 caractere." };

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Utilizator negăsit." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Parola curentă este greșită." };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
