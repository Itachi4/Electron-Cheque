-- CreateTable
CREATE TABLE "ChequeTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "background" TEXT NOT NULL,
    "fieldMap" JSONB NOT NULL,

    CONSTRAINT "ChequeTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChequeTemplate" ADD CONSTRAINT "ChequeTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequeTemplate" ADD CONSTRAINT "ChequeTemplate_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
