-- Delete users that have no associated Mentor or Player record
-- and are not SUPER_ADMIN
DELETE FROM "User"
WHERE role != 'SUPER_ADMIN'
  AND id NOT IN (SELECT userId FROM "Mentor")
  AND id NOT IN (SELECT userId FROM "Player");
