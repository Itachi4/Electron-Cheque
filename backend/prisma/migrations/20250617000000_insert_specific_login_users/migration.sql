-- CreateDate: 2025-06-17T00:00:00.000Z

-- Add specific login users if they do not exist
INSERT INTO "User" ("email", "password", "name", "role", "createdAt", "updatedAt")
VALUES ('faizuddinM@myb-site.com', '123456789', 'Faizuddin M', 'accountant', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "User" ("email", "password", "name", "role", "createdAt", "updatedAt")
VALUES ('xyz@gmail.com', '123456789', 'XYZ User', 'accountant', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING; 