import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// vi.mock factories are hoisted — do NOT reference top-level variables inside them.
vi.mock("@/lib/auth", () => ({
  requireMentor: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    player: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    checkinAnswer: {
      upsert: vi.fn(),
    },
    mentor: {
      findUnique: vi.fn(),
    },
    libraryItem: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("@/lib/upload", () => ({
  deleteFile: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { createPlayer } from "@/actions/mentor";
import { db } from "@/lib/db";
import { getSession, requireMentor } from "@/lib/auth";

const mockDb = db as {
  user: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  player: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const mentorSession = { userId: 1, role: "MENTOR", mentorId: 10 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

const validPlayerFields = {
  username: "newplayer",
  password: "securepassword",
  name: "Ion Popescu",
  team: "Team A",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("createPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(mentorSession as never);
    vi.mocked(requireMentor).mockResolvedValue(mentorSession as never);
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: 99 });
  });

  it("returns error when required fields are missing", async () => {
    const result = await createPlayer(null, makeFormData({ username: "", password: "", name: "" }));
    expect(result.error).toBe("Câmpurile obligatorii sunt incomplete.");
  });

  it("returns error when username is missing", async () => {
    const result = await createPlayer(
      null,
      makeFormData({ username: "", password: "securepassword", name: "Ion Popescu" })
    );
    expect(result.error).toBe("Câmpurile obligatorii sunt incomplete.");
  });

  it("returns error when name is missing", async () => {
    const result = await createPlayer(
      null,
      makeFormData({ username: "player1", password: "securepassword", name: "" })
    );
    expect(result.error).toBe("Câmpurile obligatorii sunt incomplete.");
  });

  it("returns error when password is too short", async () => {
    const result = await createPlayer(
      null,
      makeFormData({ username: "player1", password: "short", name: "Ion Popescu" })
    );
    expect(result.error).toBe("Parola trebuie să aibă cel puțin 8 caractere.");
  });

  it("returns error when username already exists", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({ id: 5, username: "newplayer" });
    const result = await createPlayer(null, makeFormData(validPlayerFields));
    expect(result.error).toBe("Utilizatorul există deja.");
  });

  it("creates player successfully with all required fields", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null);
    mockDb.user.create.mockResolvedValueOnce({ id: 99 });

    const result = await createPlayer(null, makeFormData(validPlayerFields));
    expect(result.success).toBe(true);
    expect(mockDb.user.create).toHaveBeenCalledOnce();
  });

  it("creates player successfully with optional playfieldPositionId", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null);
    mockDb.user.create.mockResolvedValueOnce({ id: 99 });

    const result = await createPlayer(
      null,
      makeFormData({ ...validPlayerFields, playfieldPositionId: "3" })
    );
    expect(result.success).toBe(true);
    const createCall = mockDb.user.create.mock.calls[0][0];
    expect(createCall.data.player.create.playfieldPositionId).toBe(3);
  });

  it("creates player successfully with dateOfBirth", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null);
    mockDb.user.create.mockResolvedValueOnce({ id: 99 });

    const result = await createPlayer(
      null,
      makeFormData({ ...validPlayerFields, dateOfBirth: "2000-05-15" })
    );
    expect(result.success).toBe(true);
    const createCall = mockDb.user.create.mock.calls[0][0];
    expect(createCall.data.player.create.dateOfBirth).toBeInstanceOf(Date);
  });
});
