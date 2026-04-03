-- CreateTable
CREATE TABLE "ImprovementWay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImprovementWay_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImprovementWayRating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "improvementWayId" INTEGER NOT NULL,
    "day" DATETIME NOT NULL,
    "score" INTEGER NOT NULL,
    CONSTRAINT "ImprovementWayRating_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ImprovementWayRating_improvementWayId_fkey" FOREIGN KEY ("improvementWayId") REFERENCES "ImprovementWay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ImprovementWayRating_playerId_improvementWayId_day_key" ON "ImprovementWayRating"("playerId", "improvementWayId", "day");
