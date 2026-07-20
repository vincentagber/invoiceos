-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('VAT', 'GST', 'SALES_TAX', 'WITHHOLDING', 'CORPORATE', 'EXCISE', 'CONSUMPTION', 'LUXURY', 'ENVIRONMENTAL', 'EDUCATION', 'HEALTH', 'CUSTOMS', 'STAMP', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxCalculationMethod" AS ENUM ('EXCLUSIVE', 'INCLUSIVE', 'COMPOUND', 'ZERO_RATED', 'REVERSE_CHARGE');

-- CreateEnum
CREATE TYPE "TaxApplication" AS ENUM ('ITEM_LEVEL', 'INVOICE_LEVEL', 'SHIPPING_LEVEL');

-- CreateTable
CREATE TABLE "ComplianceConfig" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "governingBody" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "invoiceNumberLength" INTEGER NOT NULL DEFAULT 8,
    "invoiceNumberPattern" TEXT,
    "qrRequired" BOOLEAN NOT NULL DEFAULT false,
    "electronicSignatureRequired" BOOLEAN NOT NULL DEFAULT false,
    "continuousTransmission" BOOLEAN NOT NULL DEFAULT false,
    "portalName" TEXT NOT NULL DEFAULT '',
    "portalUrl" TEXT,
    "defaultVatRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "defaultWhtRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "defaultCorporateRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "devLevyRate" DECIMAL(5,2),
    "accountingStandard" TEXT NOT NULL DEFAULT 'IFRS',
    "fiscalYearStart" TEXT NOT NULL DEFAULT '01-01',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "requiresTaxRegistration" BOOLEAN NOT NULL DEFAULT true,
    "registrationUrl" TEXT,
    "registrationFormat" TEXT,
    "registrationExample" TEXT,
    "supersededById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDeadline" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "dueDay" INTEGER,
    "dueMonth" INTEGER,
    "dueDescription" TEXT NOT NULL,
    "governingBody" TEXT NOT NULL,
    "formName" TEXT,
    "portalSection" TEXT,
    "penaltyLate" DECIMAL(12,2),
    "penaltyRate" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "TaxType" NOT NULL,
    "method" "TaxCalculationMethod" NOT NULL DEFAULT 'EXCLUSIVE',
    "application" "TaxApplication" NOT NULL DEFAULT 'INVOICE_LEVEL',
    "rate" DECIMAL(5,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isStackable" BOOLEAN NOT NULL DEFAULT true,
    "isRefundable" BOOLEAN NOT NULL DEFAULT false,
    "isWithholding" BOOLEAN NOT NULL DEFAULT false,
    "isReverseCharge" BOOLEAN NOT NULL DEFAULT false,
    "minimumThreshold" DECIMAL(14,2),
    "maximumThreshold" DECIMAL(14,2),
    "exemptionCodes" TEXT,
    "appliesTo" TEXT,
    "customerType" TEXT,
    "compoundOnParentId" TEXT,
    "reportingCode" TEXT,
    "reportingName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentConnector" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseUrl" TEXT,
    "apiVersion" TEXT,
    "authType" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "documentationUrl" TEXT,
    "statusUrl" TEXT,
    "providerConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentConnector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceConfig_countryCode_isActive_idx" ON "ComplianceConfig"("countryCode", "isActive");

-- CreateIndex
CREATE INDEX "ComplianceConfig_countryCode_effectiveFrom_effectiveTo_idx" ON "ComplianceConfig"("countryCode", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceConfig_countryCode_effectiveFrom_key" ON "ComplianceConfig"("countryCode", "effectiveFrom");

-- CreateIndex
CREATE INDEX "ComplianceDeadline_configId_isActive_idx" ON "ComplianceDeadline"("configId", "isActive");

-- CreateIndex
CREATE INDEX "TaxRule_configId_isActive_idx" ON "TaxRule"("configId", "isActive");

-- CreateIndex
CREATE INDEX "TaxRule_configId_type_idx" ON "TaxRule"("configId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRule_configId_code_effectiveFrom_key" ON "TaxRule"("configId", "code", "effectiveFrom");

-- CreateIndex
CREATE INDEX "GovernmentConnector_configId_type_idx" ON "GovernmentConnector"("configId", "type");

-- AddForeignKey
ALTER TABLE "ComplianceConfig" ADD CONSTRAINT "ComplianceConfig_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "ComplianceConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDeadline" ADD CONSTRAINT "ComplianceDeadline_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ComplianceConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ComplianceConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_compoundOnParentId_fkey" FOREIGN KEY ("compoundOnParentId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentConnector" ADD CONSTRAINT "GovernmentConnector_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ComplianceConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
