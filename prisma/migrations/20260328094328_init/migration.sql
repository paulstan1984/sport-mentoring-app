-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Mentor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "description" TEXT,
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mentor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayfieldPosition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "playfieldPositionId" INTEGER,
    "team" TEXT,
    "objective" TEXT,
    "mentorId" INTEGER NOT NULL,
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Player_playfieldPositionId_fkey" FOREIGN KEY ("playfieldPositionId") REFERENCES "PlayfieldPosition" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Player_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckinForm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    CONSTRAINT "CheckinForm_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckinFormItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "allowAdditionalString" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    CONSTRAINT "CheckinFormItem_formId_fkey" FOREIGN KEY ("formId") REFERENCES "CheckinForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckinAnswer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "flagId" INTEGER NOT NULL,
    "day" DATETIME NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "stringValue" TEXT,
    CONSTRAINT "CheckinAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CheckinAnswer_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "CheckinFormItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyJournal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "day" DATETIME NOT NULL,
    "whatDidGood" TEXT,
    "whatDidWrong" TEXT,
    "whatCanDoBetter" TEXT,
    "myScore" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DailyJournal_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyScope" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "scope" TEXT,
    "accomplished" BOOLEAN,
    CONSTRAINT "WeeklyScope_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfidenceLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "day" DATETIME NOT NULL,
    "level" TEXT NOT NULL,
    CONSTRAINT "ConfidenceLevel_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LibraryItem_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LibraryItemRead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libraryItemId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LibraryItemRead_libraryItemId_fkey" FOREIGN KEY ("libraryItemId") REFERENCES "LibraryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryItemRead_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "day" DATETIME NOT NULL,
    CONSTRAINT "DailyMessage_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_userId_key" ON "Mentor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayfieldPosition_name_key" ON "PlayfieldPosition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckinForm_mentorId_key" ON "CheckinForm"("mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckinAnswer_playerId_flagId_day_key" ON "CheckinAnswer"("playerId", "flagId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyJournal_playerId_day_key" ON "DailyJournal"("playerId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyScope_playerId_weekNumber_year_key" ON "WeeklyScope"("playerId", "weekNumber", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ConfidenceLevel_playerId_day_key" ON "ConfidenceLevel"("playerId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryItemRead_libraryItemId_playerId_key" ON "LibraryItemRead"("libraryItemId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMessage_mentorId_day_key" ON "DailyMessage"("mentorId", "day");
