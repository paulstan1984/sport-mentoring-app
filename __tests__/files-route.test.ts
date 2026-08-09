import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { unlinkSync, writeFileSync } from "fs";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    libraryItem: {
      findUnique: vi.fn(),
    },
    player: {
      findUnique: vi.fn(),
    },
  },
}));

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { GET } from "@/app/api/files/[...path]/route";

const temporaryFile = "/tmp/sport-mentor-library-file-test.pdf";
const mockGetSession = getSession as ReturnType<typeof vi.fn>;
const mockDb = db as unknown as {
  libraryItem: { findUnique: ReturnType<typeof vi.fn> };
  player: { findUnique: ReturnType<typeof vi.fn> };
};

describe("GET /api/files/[...path]", () => {
  beforeEach(() => {
    writeFileSync(temporaryFile, "test file");
    mockGetSession.mockResolvedValue({ userId: 1, role: "MENTOR", mentorId: 2 });
    mockDb.libraryItem.findUnique.mockResolvedValue({
      id: 1,
      mentorId: 2,
      name: "Plan săptămânal",
      fileType: "pdf",
      filePath: temporaryFile,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    unlinkSync(temporaryFile);
  });

  it("forces an attachment download for library files", async () => {
    const response = await GET(new NextRequest("https://example.com/api/files/1"), {
      params: Promise.resolve({ path: ["1"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Plan%20s%C4%83pt%C4%83m%C3%A2nal.pdf"'
    );
  });
});
