-- /*
--   Warnings:

--   - Made the column `routingNumber` on table `Bank` required. This step will fail if there are existing NULL values in that column.

-- */
-- -- AlterTable
-- ALTER TABLE "Bank" ALTER COLUMN "routingNumber" SET NOT NULL;

-- Add specific users
INSERT INTO "User" ("email", "password", "name", "role", "createdAt", "updatedAt")
VALUES ('faizuddinM@myb-site.com', '123456789', 'Faizuddin M', 'accountant', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "User" ("email", "password", "name", "role", "createdAt", "updatedAt")
VALUES ('xyz@gmail.com', '123456789', 'XYZ User', 'accountant', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;
