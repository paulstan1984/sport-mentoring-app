import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    pushSubscription: {
      findFirst: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/push/subscribe/route";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const mockDb = db as unknown as {
  pushSubscription: { findFirst: ReturnType<typeof vi.fn> };
};

describe("GET /api/push/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: undefined } as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockDb.pushSubscription.findFirst).not.toHaveBeenCalled();
  });

  it("returns whether the authenticated user has a native subscription", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: 12 } as never);
    mockDb.pushSubscription.findFirst.mockResolvedValue({ id: 1 });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ subscribed: true });
    expect(mockDb.pushSubscription.findFirst).toHaveBeenCalledWith({
      where: { userId: 12, endpoint: { startsWith: "fcm://" } },
      select: { id: true },
    });
  });

  it("reports when the user has not enabled native notifications", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: 12 } as never);
    mockDb.pushSubscription.findFirst.mockResolvedValue(null);

    const response = await GET();

    await expect(response.json()).resolves.toEqual({ subscribed: false });
  });
});
