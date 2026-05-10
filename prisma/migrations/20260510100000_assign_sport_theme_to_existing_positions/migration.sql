-- Assign SPORT_MENTOR theme to all existing positions that don't have a theme
UPDATE "PlayfieldPosition" SET "theme" = 'SPORT_MENTOR' WHERE "theme" IS NULL;
