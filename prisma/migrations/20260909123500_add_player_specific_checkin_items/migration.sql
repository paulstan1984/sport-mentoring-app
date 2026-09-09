-- AlterTable: add optional playerId to CheckinFormItem for player-specific items
ALTER TABLE "CheckinFormItem" ADD COLUMN "playerId" INTEGER;

-- Index for item queries by form/player/order
CREATE INDEX IF NOT EXISTS "CheckinFormItem_formId_playerId_deletedAt_order_idx"
  ON "CheckinFormItem"("formId", "playerId", "deletedAt", "order");
