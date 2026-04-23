import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// vi.mock factories are hoisted — do NOT reference top-level variables inside them.
vi.mock("@/lib/auth", () => ({
  requirePlayer: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    player: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    dailyJournal: {
      upsert: vi.fn(),
    },
    weeklyScope: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    confidenceLevel: {
      upsert: vi.fn(),
    },
    checkinAnswer: {
      upsert: vi.fn(),
    },
    libraryItem: {
      findFirst: vi.fn(),
    },
    libraryItemRead: {
      upsert: vi.fn(),
    },
    improvementWayRating: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("hashed_new_password"),
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

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import {
  submitJournal,
  saveWeeklyScope,
  toggleWeeklyScope,
  setConfidenceLevel,
  submitCheckin,
  markLibraryItemRead,
  updatePlayerObjective,
  changePlayerPassword,
} from "@/actions/player";
import { db } from "@/lib/db";
import { getSession, requirePlayer } from "@/lib/auth";
import bcrypt from "bcryptjs";

const mockDb = db as {
  player: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  user: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  dailyJournal: { upsert: ReturnType<typeof vi.fn> };
  weeklyScope: {
    upsert: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  confidenceLevel: { upsert: ReturnType<typeof vi.fn> };
  checkinAnswer: { upsert: ReturnType<typeof vi.fn> };
  libraryItem: { findFirst: ReturnType<typeof vi.fn> };
  libraryItemRead: { upsert: ReturnType<typeof vi.fn> };
  improvementWayRating: { upsert: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockBcrypt = bcrypt as { compare: ReturnType<typeof vi.fn>; hash: ReturnType<typeof vi.fn> };

const playerSession = { userId: 3, role: "PLAYER", playerId: 20 };

const mockDbPlayer = {
  id: 20,
  mentorId: 10,
  isActive: true,
  mentor: {
    checkinForm: {
      items: [
        { id: 1, allowAdditionalString: false },
        { id: 2, allowAdditionalString: true },
      ],
    },
    improvementWays: [
      { id: 1, label: "Forță" },
      { id: 2, label: "Viteză" },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("submitJournal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.dailyJournal.upsert.mockResolvedValue({});
  });

  it("saves journal entry successfully", async () => {
    const result = await submitJournal(
      null,
      makeFormData({
        whatDidGood: "Am alergat bine",
        whatDidWrong: "Am greșit pasele",
        whatCanDoBetter: "Să fiu mai concentrat",
        myScore: "4",
      })
    );
    expect(result.success).toBe(true);
    expect(mockDb.dailyJournal.upsert).toHaveBeenCalledOnce();
  });

  it("saves journal entry with empty fields", async () => {
    const result = await submitJournal(null, makeFormData({ myScore: "3" }));
    expect(result.success).toBe(true);
  });

  it("clamps score to max 5", async () => {
    await submitJournal(null, makeFormData({ myScore: "10" }));
    const call = mockDb.dailyJournal.upsert.mock.calls[0][0];
    expect(call.create.myScore).toBe(5);
  });

  it("clamps score to min 0", async () => {
    await submitJournal(null, makeFormData({ myScore: "-5" }));
    const call = mockDb.dailyJournal.upsert.mock.calls[0][0];
    expect(call.create.myScore).toBe(0);
  });
});

describe("saveWeeklyScope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.weeklyScope.upsert.mockResolvedValue({});
  });

  it("saves weekly scope successfully", async () => {
    const result = await saveWeeklyScope(
      null,
      makeFormData({ scope: "Vreau să îmbunătățesc viteza" })
    );
    expect(result.success).toBe(true);
    expect(mockDb.weeklyScope.upsert).toHaveBeenCalledOnce();
  });

  it("saves empty weekly scope", async () => {
    const result = await saveWeeklyScope(null, makeFormData({}));
    expect(result.success).toBe(true);
  });
});

describe("toggleWeeklyScope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.weeklyScope.update.mockResolvedValue({});
  });

  it("returns error when scope not found", async () => {
    mockDb.weeklyScope.findFirst.mockResolvedValueOnce(null);
    const result = await toggleWeeklyScope(999, true);
    expect(result.error).toBe("Obiectivul nu a fost găsit.");
  });

  it("marks scope as accomplished successfully", async () => {
    mockDb.weeklyScope.findFirst.mockResolvedValueOnce({ id: 5, playerId: 20 });
    const result = await toggleWeeklyScope(5, true);
    expect(result.success).toBe(true);
    expect(mockDb.weeklyScope.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { accomplished: true },
    });
  });

  it("marks scope as not accomplished successfully", async () => {
    mockDb.weeklyScope.findFirst.mockResolvedValueOnce({ id: 5, playerId: 20 });
    const result = await toggleWeeklyScope(5, false);
    expect(result.success).toBe(true);
    expect(mockDb.weeklyScope.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { accomplished: false },
    });
  });
});

describe("setConfidenceLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.confidenceLevel.upsert.mockResolvedValue({});
  });

  it("sets confidence level to GOOD", async () => {
    const result = await setConfidenceLevel("GOOD");
    expect(result.success).toBe(true);
    expect(mockDb.confidenceLevel.upsert).toHaveBeenCalledOnce();
    const call = mockDb.confidenceLevel.upsert.mock.calls[0][0];
    expect(call.create.level).toBe("GOOD");
  });

  it("sets confidence level to OK", async () => {
    const result = await setConfidenceLevel("OK");
    expect(result.success).toBe(true);
    const call = mockDb.confidenceLevel.upsert.mock.calls[0][0];
    expect(call.create.level).toBe("OK");
  });

  it("sets confidence level to HARD", async () => {
    const result = await setConfidenceLevel("HARD");
    expect(result.success).toBe(true);
    const call = mockDb.confidenceLevel.upsert.mock.calls[0][0];
    expect(call.create.level).toBe("HARD");
  });
});

describe("submitCheckin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.$transaction.mockResolvedValue([]);
  });

  it("returns error when checkin form not available", async () => {
    mockDb.player.findUnique.mockResolvedValueOnce(null);
    const result = await submitCheckin(null, makeFormData({}));
    expect(result.error).toBe("Formularul nu este disponibil.");
  });

  it("returns error when mentor has no checkin form", async () => {
    mockDb.player.findUnique.mockResolvedValueOnce({
      ...mockDbPlayer,
      mentor: { checkinForm: null },
    });
    const result = await submitCheckin(null, makeFormData({}));
    expect(result.error).toBe("Formularul nu este disponibil.");
  });

  it("submits checkin successfully", async () => {
    mockDb.player.findUnique.mockResolvedValueOnce(mockDbPlayer);

    const fd = makeFormData({ flag_1: "on", flag_2: "on", string_2: "detaliu" });
    const result = await submitCheckin(null, fd);
    expect(result.success).toBe(true);
    expect(mockDb.$transaction).toHaveBeenCalledOnce();
  });
});

describe("markLibraryItemRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.libraryItemRead.upsert.mockResolvedValue({});
  });

  it("returns error when player not found", async () => {
    mockDb.player.findUnique.mockResolvedValueOnce(null);
    const result = await markLibraryItemRead(1);
    expect(result.error).toBe("Jucător negăsit.");
  });

  it("returns error when library item not in mentor's library", async () => {
    mockDb.player.findUnique.mockResolvedValueOnce({ id: 20, mentorId: 10 });
    mockDb.libraryItem.findFirst.mockResolvedValueOnce(null);
    const result = await markLibraryItemRead(999);
    expect(result.error).toBe("Element negăsit.");
  });

  it("marks library item as read successfully", async () => {
    mockDb.player.findUnique.mockResolvedValueOnce({ id: 20, mentorId: 10 });
    mockDb.libraryItem.findFirst.mockResolvedValueOnce({ id: 1, mentorId: 10 });
    const result = await markLibraryItemRead(1);
    expect(result.success).toBe(true);
    expect(mockDb.libraryItemRead.upsert).toHaveBeenCalledOnce();
  });
});

describe("updatePlayerObjective", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.player.update.mockResolvedValue({});
  });

  it("updates player objective successfully", async () => {
    const result = await updatePlayerObjective(
      null,
      makeFormData({ objective: "Vreau să devin titular" })
    );
    expect(result.success).toBe(true);
    expect(mockDb.player.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { objective: "Vreau să devin titular" },
    });
  });

  it("clears player objective when empty", async () => {
    const result = await updatePlayerObjective(null, makeFormData({}));
    expect(result.success).toBe(true);
    expect(mockDb.player.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { objective: null },
    });
  });
});

describe("changePlayerPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue(playerSession as never);
    vi.mocked(requirePlayer).mockResolvedValue(playerSession as never);
    mockDb.user.update.mockResolvedValue({});
  });

  it("returns error when fields are missing", async () => {
    const result = await changePlayerPassword(
      null,
      makeFormData({ currentPassword: "", newPassword: "" })
    );
    expect(result.error).toBe("Completați toate câmpurile.");
  });

  it("returns error when new password is too short", async () => {
    const result = await changePlayerPassword(
      null,
      makeFormData({ currentPassword: "oldpass123", newPassword: "short" })
    );
    expect(result.error).toBe("Parola nouă trebuie să aibă cel puțin 8 caractere.");
  });

  it("returns error when user not found", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null);
    const result = await changePlayerPassword(
      null,
      makeFormData({ currentPassword: "oldpass123", newPassword: "newpassword123" })
    );
    expect(result.error).toBe("Utilizator negăsit.");
  });

  it("returns error when current password is wrong", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({ id: 3, passwordHash: "hash" });
    mockBcrypt.compare.mockResolvedValueOnce(false);
    const result = await changePlayerPassword(
      null,
      makeFormData({ currentPassword: "wrongpass", newPassword: "newpassword123" })
    );
    expect(result.error).toBe("Parola curentă este greșită.");
  });

  it("changes password successfully", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({ id: 3, passwordHash: "hash" });
    mockBcrypt.compare.mockResolvedValueOnce(true);
    mockBcrypt.hash.mockResolvedValueOnce("new_hashed_password");
    const result = await changePlayerPassword(
      null,
      makeFormData({ currentPassword: "password123", newPassword: "newpassword123" })
    );
    expect(result.success).toBe(true);
    expect(mockDb.user.update).toHaveBeenCalledOnce();
  });
});
