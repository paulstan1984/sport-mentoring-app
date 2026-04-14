/*
  Warnings:

  - Added the required column `updatedAt` to the `CheckinAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DailyJournal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WeeklyScope` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CheckinAnswer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "flagId" INTEGER NOT NULL,
    "day" DATETIME NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "stringValue" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckinAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CheckinAnswer_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "CheckinFormItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CheckinAnswer" ("checked", "day", "flagId", "id", "playerId", "stringValue", "updatedAt") SELECT "checked", "day", "flagId", "id", "playerId", "stringValue", CURRENT_TIMESTAMP FROM "CheckinAnswer";
DROP TABLE "CheckinAnswer";
ALTER TABLE "new_CheckinAnswer" RENAME TO "CheckinAnswer";
CREATE UNIQUE INDEX "CheckinAnswer_playerId_flagId_day_key" ON "CheckinAnswer"("playerId", "flagId", "day");
CREATE TABLE "new_DailyJournal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "day" DATETIME NOT NULL,
    "whatDidGood" TEXT,
    "whatDidWrong" TEXT,
    "whatCanDoBetter" TEXT,
    "myScore" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyJournal_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DailyJournal" ("day", "id", "myScore", "playerId", "whatCanDoBetter", "whatDidGood", "whatDidWrong", "updatedAt") SELECT "day", "id", "myScore", "playerId", "whatCanDoBetter", "whatDidGood", "whatDidWrong", CURRENT_TIMESTAMP FROM "DailyJournal";
DROP TABLE "DailyJournal";
ALTER TABLE "new_DailyJournal" RENAME TO "DailyJournal";
CREATE UNIQUE INDEX "DailyJournal_playerId_day_key" ON "DailyJournal"("playerId", "day");
CREATE TABLE "new_WeeklyScope" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "scope" TEXT,
    "accomplished" BOOLEAN,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeeklyScope_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WeeklyScope" ("accomplished", "id", "playerId", "scope", "weekNumber", "year", "updatedAt") SELECT "accomplished", "id", "playerId", "scope", "weekNumber", "year", CURRENT_TIMESTAMP FROM "WeeklyScope";
DROP TABLE "WeeklyScope";
ALTER TABLE "new_WeeklyScope" RENAME TO "WeeklyScope";
CREATE UNIQUE INDEX "WeeklyScope_playerId_weekNumber_year_key" ON "WeeklyScope"("playerId", "weekNumber", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
