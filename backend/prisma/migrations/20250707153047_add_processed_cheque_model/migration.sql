-- CreateTable
CREATE TABLE "ProcessedCheque" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileName" TEXT NOT NULL,
    "finalPath" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "chequeNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'awaiting_confirmation',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
