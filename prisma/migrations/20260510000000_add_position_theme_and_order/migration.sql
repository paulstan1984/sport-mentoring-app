-- AlterTable: add theme and order to PlayfieldPosition
ALTER TABLE "PlayfieldPosition" ADD COLUMN "theme" TEXT;
ALTER TABLE "PlayfieldPosition" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
