import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// vi.mock factories are hoisted — do NOT reference top-level variables inside them.
vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    mentor: { findUnique: vi.fn() },
    player: { findUnique: vi.fn() },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { login, logout } from "@/actions/auth";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const mockDb = db as {
  user: { findUnique: ReturnType<typeof vi.fn> };
  mentor: { findUnique: ReturnType<typeof vi.fn> };
  player: { findUnique: ReturnType<typeof vi.fn> };
};

const mockBcrypt = bcrypt as { compare: ReturnType<typeof vi.fn>; hash: ReturnType<typeof vi.fn> };

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

function makeSession(overrides = {}) {
  return {
    userId: undefined as number | undefined,
    role: undefined as string | undefined,
    mentorId: undefined as number | undefined,
    playerId: undefined as number | undefined,
    save: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("login", () => {
  let mockSession: ReturnType<typeof makeSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = makeSession();
    vi.mocked(getSession).mockResolvedValue(mockSession as never);
  });

  it("returns error when fields are missing", async () => {
    const result = await login(null, makeFormData({ username: "", password: "" }));
    expect(result.error).toBe("Completați toate câmpurile.");
  });

  it("returns error when username is missing", async () => {
    const result = await login(null, makeFormData({ username: "", password: "secret123" }));
    expect(result.error).toBe("Completați toate câmpurile.");
  });

  it("returns error when password is missing", async () => {
    const result = await login(null, makeFormData({ username: "user1", password: "" }));
    expect(result.error).toBe("Completați toate câmpurile.");
  });

  it("returns error when user does not exist", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null);
    const result = await login(null, makeFormData({ username: "unknown", password: "password123" }));
    expect(result.error).toBe("Utilizator sau parolă incorectă.");
  });

  it("returns error when password is wrong", async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({ id: 1, username: "mentor1", passwordHash: "hash", role: "MENTOR" });
    mockBcrypt.compare.mockResolvedValueOnce(false);
    const result = await login(null, makeFormData({ username: "mentor1", password: "wrongpassword" }));
    expect(result.error).toBe("Utilizator sau parolă incorectă.");
  });

  describe("MENTOR login", () => {
    it("returns error when mentor account is inactive", async () => {
      mockDb.user.findUnique.mockResolvedValueOnce({ id: 1, username: "mentor1", passwordHash: "hash", role: "MENTOR" });
      mockBcrypt.compare.mockResolvedValueOnce(true);
      mockDb.mentor.findUnique.mockResolvedValueOnce({ id: 10, userId: 1, isActive: false });

      const result = await login(null, makeFormData({ username: "mentor1", password: "password123" }));
      expect(result.error).toBe("Contul tău a fost dezactivat. Contactează administratorul.");
    });

    it("redirects to /mentor/dashboard on successful login", async () => {
      mockDb.user.findUnique.mockResolvedValueOnce({ id: 1, username: "mentor1", passwordHash: "hash", role: "MENTOR" });
      mockBcrypt.compare.mockResolvedValueOnce(true);
      mockDb.mentor.findUnique.mockResolvedValueOnce({ id: 10, userId: 1, isActive: true });

      await expect(
        login(null, makeFormData({ username: "mentor1", password: "password123" }))
      ).rejects.toThrow("NEXT_REDIRECT:/mentor/dashboard");

      expect(mockSession.save).toHaveBeenCalled();
      expect(mockSession.userId).toBe(1);
      expect(mockSession.role).toBe("MENTOR");
      expect(mockSession.mentorId).toBe(10);
    });
  });

  describe("SUPER_ADMIN login", () => {
    it("redirects to /admin/mentors on successful login", async () => {
      mockDb.user.findUnique.mockResolvedValueOnce({ id: 2, username: "admin", passwordHash: "hash", role: "SUPER_ADMIN" });
      mockBcrypt.compare.mockResolvedValueOnce(true);

      await expect(
        login(null, makeFormData({ username: "admin", password: "password123" }))
      ).rejects.toThrow("NEXT_REDIRECT:/admin/mentors");

      expect(mockSession.save).toHaveBeenCalled();
      expect(mockSession.userId).toBe(2);
      expect(mockSession.role).toBe("SUPER_ADMIN");
    });
  });

  describe("PLAYER login", () => {
    it("returns error when player account is inactive", async () => {
      mockDb.user.findUnique.mockResolvedValueOnce({ id: 3, username: "player1", passwordHash: "hash", role: "PLAYER" });
      mockBcrypt.compare.mockResolvedValueOnce(true);
      mockDb.player.findUnique.mockResolvedValueOnce({ id: 20, userId: 3, isActive: false });

      const result = await login(null, makeFormData({ username: "player1", password: "password123" }));
      expect(result.error).toBe("Contul tău a fost dezactivat. Contactează antrenorul.");
    });

    it("redirects to /player/dashboard on successful login", async () => {
      mockDb.user.findUnique.mockResolvedValueOnce({ id: 3, username: "player1", passwordHash: "hash", role: "PLAYER" });
      mockBcrypt.compare.mockResolvedValueOnce(true);
      mockDb.player.findUnique.mockResolvedValueOnce({ id: 20, userId: 3, isActive: true });

      await expect(
        login(null, makeFormData({ username: "player1", password: "password123" }))
      ).rejects.toThrow("NEXT_REDIRECT:/player/dashboard");

      expect(mockSession.save).toHaveBeenCalled();
      expect(mockSession.userId).toBe(3);
      expect(mockSession.role).toBe("PLAYER");
      expect(mockSession.playerId).toBe(20);
    });
  });
});

describe("logout", () => {
  let mockSession: ReturnType<typeof makeSession>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = makeSession();
    vi.mocked(getSession).mockResolvedValue(mockSession as never);
  });

  it("destroys the session and redirects to /login", async () => {
    await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockSession.destroy).toHaveBeenCalled();
  });
});
