-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "applyWht" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTaxInclusive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whtRateOverride" DECIMAL(5,2);
