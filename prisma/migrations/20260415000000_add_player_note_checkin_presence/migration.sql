-- AlterTable: add checkinPresence to PlayerNote
-- SQLite does not support adding columns with constraints in one step,
-- so we use a simple ALTER TABLE ADD COLUMN with a DEFAULT.
ALTER TABLE "PlayerNote" ADD COLUMN "checkinPresence" BOOLEAN NOT NULL DEFAULT false;
