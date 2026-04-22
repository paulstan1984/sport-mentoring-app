-- CreateTable: AdminRequest (replaces MentorSignupRequest with added fields)
CREATE TABLE "AdminRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestType" TEXT NOT NULL DEFAULT 'SIGNUP',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mentorId" INTEGER,
    "requestedLevel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "AdminRequest_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CopyData: migrate existing signup requests
INSERT INTO "AdminRequest" ("id", "requestType", "name", "email", "description", "status", "createdAt", "processedAt")
SELECT "id", 'SIGNUP', "name", "email", "description", "status", "createdAt", "processedAt"
FROM "MentorSignupRequest";

-- DropTable
DROP TABLE "MentorSignupRequest";

-- AlterTable: add level to Mentor
ALTER TABLE "Mentor" ADD COLUMN "level" TEXT NOT NULL DEFAULT 'FREE';
