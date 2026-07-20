import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const countryConfigs = [
  // ═══════════════════════════════════════════════
  // NIGERIA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'NG',
    countryName: 'Nigeria',
    currency: 'NGN',
    governingBody: 'FIRS',
    invoicePrefix: 'INV',
    qrRequired: false,
    electronicSignatureRequired: false,
    portalName: 'FIRS TaxPro-Max',
    portalUrl: 'https://taxpromax.firs.gov.ng',
    defaultVatRate: 7.5,
    defaultWhtRate: 5.0,
    defaultCorporateRate: 30.0,
    devLevyRate: 4.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    requiresTaxRegistration: true,
    registrationFormat: 'RC-{NUMBER}',
    registrationExample: 'RC-1234567',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 7.5, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax (5%)', code: 'WHT_5', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 5.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Withholding Tax (10%)', code: 'WHT_10', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 10.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-02', minimumThreshold: 1000000 },
      { name: 'Corporate Income Tax', code: 'CIT_LARGE', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 30.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01', minimumThreshold: 100000000 },
      { name: 'Corporate Income Tax (Medium)', code: 'CIT_MEDIUM', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 20.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-02', minimumThreshold: 25000000, maximumThreshold: 100000000 },
      { name: 'Development Levy', code: 'DEV_LEVY', type: 'OTHER', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 4.0, priority: 3, isStackable: true, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'LEVY-01', minimumThreshold: 25000000 },
      { name: 'NHIS Levy', code: 'NHIS', type: 'HEALTH', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 1.0, priority: 4, isStackable: true, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'LEVY-02' },
    ],
    deadlines: [
      { name: 'VAT Remittance', frequency: 'MONTHLY', dueDay: 21, dueDescription: '21st of every month', governingBody: 'FIRS', formName: 'VAT 7', penaltyLate: 50000, penaltyRate: 5.0 },
      { name: 'WHT Returns', frequency: 'MONTHLY', dueDay: 21, dueDescription: '21st of every month', governingBody: 'FIRS', formName: 'WHT 1', penaltyLate: 25000, penaltyRate: 5.0 },
      { name: 'PAYE Remittance', frequency: 'MONTHLY', dueDay: 10, dueDescription: '10th of every month', governingBody: 'State IRS', formName: 'PAYE Schedule' },
      { name: 'Annual CIT Filing', frequency: 'ANNUALLY', dueMonth: 6, dueDay: 30, dueDescription: 'June 30th annually', governingBody: 'FIRS', formName: 'CIT 102' },
      { name: 'Annual CAC Returns', frequency: 'ANNUALLY', dueMonth: 6, dueDay: 30, dueDescription: 'June 30th', governingBody: 'CAC' },
    ],
    connectors: [
      { name: 'FIRS TaxPro-Max', provider: 'FIRS', type: 'TAX_FILING', baseUrl: 'https://api.taxpromax.firs.gov.ng', apiVersion: 'v1', authType: 'API_KEY', isAvailable: false, isMandatory: true },
      { name: 'CAC Business Registry', provider: 'CAC', type: 'BUSINESS_REGISTRATION', baseUrl: 'https://api.cac.gov.ng', apiVersion: 'v2', authType: 'API_KEY', isAvailable: false, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // GHANA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'GH',
    countryName: 'Ghana',
    currency: 'GHS',
    governingBody: 'GRA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: true,
    continuousTransmission: true,
    portalName: 'GRA Certified Billing System',
    portalUrl: 'https://cbs.ghra.gov.gh',
    defaultVatRate: 15.0,
    defaultWhtRate: 7.5,
    defaultCorporateRate: 25.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    requiresTaxRegistration: true,
    registrationFormat: 'TIN-{NUMBER}',
    registrationExample: 'TIN-C0001234567',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 15.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'NHIL', code: 'NHIL', type: 'HEALTH', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 2.5, priority: 1, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'LEVY-01', compoundOnParent: 'VAT_STANDARD' },
      { name: 'GETFund', code: 'GETFUND', type: 'EDUCATION', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 2.5, priority: 1, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'LEVY-02', compoundOnParent: 'VAT_STANDARD' },
      { name: 'COVID-19 Levy', code: 'COVID_LEVY', type: 'HEALTH', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 1.0, priority: 2, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'LEVY-03', effectiveFrom: new Date('2026-01-01'), effectiveTo: new Date('2027-12-31') },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 7.5, priority: 3, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 25.0, priority: 4, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT/Levies Remittance', frequency: 'MONTHLY', dueDescription: 'Last working day of the month', governingBody: 'GRA', formName: 'VAT 3' },
      { name: 'WHT Remittance', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of every month', governingBody: 'GRA', formName: 'WHT 1A' },
      { name: 'Corporate Tax Return', frequency: 'ANNUALLY', dueMonth: 4, dueDay: 30, dueDescription: '4 months after financial year end', governingBody: 'GRA', formName: 'CIT 2A' },
    ],
    connectors: [
      { name: 'GRA Certified Billing System', provider: 'GRA', type: 'INVOICE_VALIDATION', baseUrl: 'https://api.cbs.gra.gov.gh', apiVersion: 'v1', authType: 'DIGITAL_SIGNATURE', isAvailable: true, isMandatory: true },
      { name: 'GRA e-Filing', provider: 'GRA', type: 'TAX_FILING', baseUrl: 'https://efiling.gra.gov.gh', apiVersion: 'v2', authType: 'API_KEY', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // KENYA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'KE',
    countryName: 'Kenya',
    currency: 'KES',
    governingBody: 'KRA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: true,
    continuousTransmission: true,
    portalName: 'KRA eTIMS',
    portalUrl: 'https://etims.kra.go.ke',
    defaultVatRate: 16.0,
    defaultWhtRate: 5.0,
    defaultCorporateRate: 30.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    requiresTaxRegistration: true,
    registrationFormat: 'KRA PIN {NUMBER}',
    registrationExample: 'KRA PIN P051234567Z',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 16.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Zero-Rated VAT', code: 'VAT_ZERO', type: 'VAT', method: 'ZERO_RATED', application: 'INVOICE_LEVEL', rate: 0.0, priority: 0, isStackable: false, appliesTo: 'GOODS', customerType: 'BOTH', reportingCode: 'VAT-02', exemptionCodes: 'EXPORT,FOOD,AGRI' },
      { name: 'Withholding Tax (5%)', code: 'WHT_5', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 5.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Withholding Tax (3%)', code: 'WHT_3', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 3.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'GOODS', customerType: 'BUSINESS', reportingCode: 'WHT-02' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 30.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
      { name: 'Turnover Tax', code: 'TOT', type: 'OTHER', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 3.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'TOT-01', minimumThreshold: 0, maximumThreshold: 5000000 },
    ],
    deadlines: [
      { name: 'VAT Remittance (eTIMS)', frequency: 'MONTHLY', dueDay: 20, dueDescription: '20th of the following month', governingBody: 'KRA', formName: 'VAT Return' },
      { name: 'Withholding Tax (WHT)', frequency: 'MONTHLY', dueDay: 20, dueDescription: '20th of the following month', governingBody: 'KRA', formName: 'WHT Return' },
      { name: 'PAYE Remittance', frequency: 'MONTHLY', dueDay: 9, dueDescription: '9th of the following month', governingBody: 'KRA', formName: 'PAYE Return' },
      { name: 'Corporate Tax Instalments', frequency: 'QUARTERLY', dueDescription: '20th of 4th, 6th, 9th, 12th month', governingBody: 'KRA', formName: 'Instalment Tax' },
    ],
    connectors: [
      { name: 'KRA eTIMS', provider: 'KRA', type: 'INVOICE_VALIDATION', baseUrl: 'https://etims-api.kra.go.ke', apiVersion: 'v1', authType: 'DIGITAL_SIGNATURE', isAvailable: true, isMandatory: true },
      { name: 'KRA iTax', provider: 'KRA', type: 'TAX_FILING', baseUrl: 'https://api.itax.kra.go.ke', apiVersion: 'v2', authType: 'API_KEY', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // SOUTH AFRICA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'ZA',
    countryName: 'South Africa',
    currency: 'ZAR',
    governingBody: 'SARS',
    invoicePrefix: 'INV',
    qrRequired: false,
    electronicSignatureRequired: false,
    portalName: 'SARS eFiling',
    portalUrl: 'https://efiling.sars.gov.za',
    defaultVatRate: 15.0,
    defaultWhtRate: 15.0,
    defaultCorporateRate: 27.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '03-01',
    requiresTaxRegistration: true,
    registrationFormat: 'SARS {NUMBER}',
    registrationExample: 'SARS 9012345678',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 15.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Zero-Rated VAT', code: 'VAT_ZERO', type: 'VAT', method: 'ZERO_RATED', application: 'INVOICE_LEVEL', rate: 0.0, priority: 0, isStackable: false, appliesTo: 'GOODS', customerType: 'BOTH', reportingCode: 'VAT-02', exemptionCodes: 'EXPORT,FOOD,FUEL' },
      { name: 'Withholding Tax (Royalties)', code: 'WHT_ROYALTIES', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 15.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Withholding Tax (Interest)', code: 'WHT_INTEREST', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 15.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-02' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 27.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
      { name: 'Dividends Tax', code: 'DIVIDENDS', type: 'OTHER', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 20.0, priority: 3, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'DT-01' },
    ],
    deadlines: [
      { name: 'VAT Returns (Manual)', frequency: 'BI_MONTHLY', dueDescription: '25th of the month following tax period', governingBody: 'SARS', formName: 'VAT 201' },
      { name: 'VAT Returns (eFiling)', frequency: 'BI_MONTHLY', dueDescription: 'Last business day of the month following tax period', governingBody: 'SARS', formName: 'VAT 201' },
      { name: 'EMP201 (PAYE, SDL, UIF)', frequency: 'MONTHLY', dueDay: 7, dueDescription: '7th of every month', governingBody: 'SARS', formName: 'EMP201' },
      { name: 'Provisional Tax', frequency: 'SEMI_ANNUALLY', dueDescription: 'Last day of August and February', governingBody: 'SARS', formName: 'IRP6' },
      { name: 'Annual CIT Return', frequency: 'ANNUALLY', dueDescription: '12 months after financial year end', governingBody: 'SARS', formName: 'ITR14' },
    ],
    connectors: [
      { name: 'SARS eFiling', provider: 'SARS', type: 'TAX_FILING', baseUrl: 'https://api.efiling.sars.gov.za', apiVersion: 'v3', authType: 'DIGITAL_SIGNATURE', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // UGANDA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'UG',
    countryName: 'Uganda',
    currency: 'UGX',
    governingBody: 'URA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: true,
    continuousTransmission: true,
    portalName: 'URA e-Invoicing',
    portalUrl: 'https://einvoice.ura.go.ug',
    defaultVatRate: 18.0,
    defaultWhtRate: 6.0,
    defaultCorporateRate: 30.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '07-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 18.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 6.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 30.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Return', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of the following month', governingBody: 'URA' },
      { name: 'WHT Return', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of the following month', governingBody: 'URA' },
      { name: 'PAYE Remittance', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of the following month', governingBody: 'URA' },
      { name: 'Annual CIT Filing', frequency: 'ANNUALLY', dueMonth: 6, dueDay: 30, dueDescription: '6 months after financial year end', governingBody: 'URA' },
    ],
    connectors: [
      { name: 'URA e-Invoicing', provider: 'URA', type: 'INVOICE_VALIDATION', baseUrl: 'https://api.einvoice.ura.go.ug', apiVersion: 'v1', authType: 'DIGITAL_SIGNATURE', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // RWANDA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'RW',
    countryName: 'Rwanda',
    currency: 'RWF',
    governingBody: 'RRA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: true,
    continuousTransmission: true,
    portalName: 'RRA EBM',
    portalUrl: 'https://ebm.rra.gov.rw',
    defaultVatRate: 18.0,
    defaultWhtRate: 5.0,
    defaultCorporateRate: 30.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 18.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 5.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 30.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Declaration', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of the following month', governingBody: 'RRA' },
      { name: 'WHT Return', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of the following month', governingBody: 'RRA' },
      { name: 'Annual CIT', frequency: 'ANNUALLY', dueMonth: 3, dueDay: 31, dueDescription: 'March 31st', governingBody: 'RRA' },
    ],
    connectors: [
      { name: 'RRA EBM System', provider: 'RRA', type: 'INVOICE_VALIDATION', baseUrl: 'https://api.ebm.rra.gov.rw', apiVersion: 'v2', authType: 'DIGITAL_SIGNATURE', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // TANZANIA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'TZ',
    countryName: 'Tanzania',
    currency: 'TZS',
    governingBody: 'TRA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: true,
    continuousTransmission: true,
    portalName: 'TRA EFD',
    portalUrl: 'https://efd.tra.go.tz',
    defaultVatRate: 18.0,
    defaultWhtRate: 5.0,
    defaultCorporateRate: 30.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '07-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 18.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 5.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Skills Development Levy', code: 'SDL', type: 'EDUCATION', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 4.0, priority: 2, isStackable: true, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'SDL-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 30.0, priority: 3, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Return', frequency: 'MONTHLY', dueDay: 20, dueDescription: '20th of the following month', governingBody: 'TRA' },
      { name: 'WHT Return', frequency: 'MONTHLY', dueDay: 7, dueDescription: '7th of the following month', governingBody: 'TRA' },
      { name: 'SDL Remittance', frequency: 'MONTHLY', dueDay: 7, dueDescription: '7th of the following month', governingBody: 'TRA' },
      { name: 'Annual CIT', frequency: 'ANNUALLY', dueMonth: 6, dueDay: 30, dueDescription: '6 months after financial year end', governingBody: 'TRA' },
    ],
    connectors: [
      { name: 'TRA EFD System', provider: 'TRA', type: 'INVOICE_VALIDATION', baseUrl: 'https://api.efd.tra.go.tz', apiVersion: 'v1', authType: 'DIGITAL_SIGNATURE', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // BOTSWANA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'BW',
    countryName: 'Botswana',
    currency: 'BWP',
    governingBody: 'BURS',
    invoicePrefix: 'INV',
    qrRequired: false,
    electronicSignatureRequired: false,
    portalName: 'BURS e-Services',
    portalUrl: 'https://eservices.burs.org.bw',
    defaultVatRate: 14.0,
    defaultWhtRate: 5.0,
    defaultCorporateRate: 22.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '07-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 14.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 5.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 22.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Return', frequency: 'MONTHLY', dueDay: 25, dueDescription: '25th of the following month', governingBody: 'BURS' },
      { name: 'WHT Return', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of the following month', governingBody: 'BURS' },
      { name: 'Annual CIT Filing', frequency: 'ANNUALLY', dueMonth: 7, dueDay: 31, dueDescription: '7 months after financial year end', governingBody: 'BURS' },
    ],
  },

  // ═══════════════════════════════════════════════
  // NAMIBIA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'NA',
    countryName: 'Namibia',
    currency: 'NAD',
    governingBody: 'NamRA',
    invoicePrefix: 'INV',
    qrRequired: false,
    electronicSignatureRequired: false,
    portalName: 'NamRA e-Filing',
    portalUrl: 'https://efiling.namra.org.na',
    defaultVatRate: 15.0,
    defaultWhtRate: 10.0,
    defaultCorporateRate: 32.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '03-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 15.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 10.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 32.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Return', frequency: 'MONTHLY', dueDay: 20, dueDescription: '20th of the following month', governingBody: 'NamRA' },
      { name: 'PAYE Remittance', frequency: 'MONTHLY', dueDay: 7, dueDescription: '7th of the following month', governingBody: 'NamRA' },
      { name: 'Annual CIT', frequency: 'ANNUALLY', dueMonth: 6, dueDay: 30, dueDescription: '6 months after financial year end', governingBody: 'NamRA' },
    ],
  },

  // ═══════════════════════════════════════════════
  // ZAMBIA
  // ═══════════════════════════════════════════════
  {
    countryCode: 'ZM',
    countryName: 'Zambia',
    currency: 'ZMW',
    governingBody: 'ZRA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: false,
    portalName: 'ZRA e-VAT',
    portalUrl: 'https://evat.zra.org.zm',
    defaultVatRate: 16.0,
    defaultWhtRate: 15.0,
    defaultCorporateRate: 30.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 16.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 15.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 30.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Return', frequency: 'MONTHLY', dueDay: 18, dueDescription: '18th of the following month', governingBody: 'ZRA' },
      { name: 'WHT Return', frequency: 'MONTHLY', dueDay: 14, dueDescription: '14th of the following month', governingBody: 'ZRA' },
      { name: 'Annual CIT', frequency: 'ANNUALLY', dueMonth: 7, dueDay: 1, dueDescription: '3 months after financial year end', governingBody: 'ZRA' },
    ],
    connectors: [
      { name: 'ZRA e-VAT', provider: 'ZRA', type: 'INVOICE_VALIDATION', baseUrl: 'https://api.evat.zra.org.zm', apiVersion: 'v1', authType: 'API_KEY', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // ZIMBABWE
  // ═══════════════════════════════════════════════
  {
    countryCode: 'ZW',
    countryName: 'Zimbabwe',
    currency: 'USD',
    governingBody: 'ZIMRA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: false,
    portalName: 'ZIMRA e-Services',
    portalUrl: 'https://eservices.zimra.co.zw',
    defaultVatRate: 14.5,
    defaultWhtRate: 10.0,
    defaultCorporateRate: 24.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 14.5, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 10.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 24.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Return', frequency: 'MONTHLY', dueDay: 21, dueDescription: '21st of the following month', governingBody: 'ZIMRA' },
      { name: 'WHT Return', frequency: 'MONTHLY', dueDay: 10, dueDescription: '10th of the following month', governingBody: 'ZIMRA' },
      { name: 'Annual CIT Filing', frequency: 'ANNUALLY', dueMonth: 6, dueDay: 30, dueDescription: 'June 30th', governingBody: 'ZIMRA' },
    ],
    connectors: [
      { name: 'ZIMRA e-Services', provider: 'ZIMRA', type: 'TAX_FILING', baseUrl: 'https://api.eservices.zimra.co.zw', apiVersion: 'v1', authType: 'API_KEY', isAvailable: false, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // EGYPT
  // ═══════════════════════════════════════════════
  {
    countryCode: 'EG',
    countryName: 'Egypt',
    currency: 'EGP',
    governingBody: 'ETA',
    invoicePrefix: 'INV',
    qrRequired: true,
    electronicSignatureRequired: true,
    continuousTransmission: true,
    portalName: 'ETA e-Invoicing',
    portalUrl: 'https://einvoicing.eta.gov.eg',
    defaultVatRate: 14.0,
    defaultWhtRate: 5.0,
    defaultCorporateRate: 22.5,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    requiresTaxRegistration: true,
    registrationFormat: 'TAX-ID: {NUMBER}',
    registrationExample: 'TAX-ID: 123-456-789',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 14.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 5.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 22.5, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
      { name: 'Stamp Tax', code: 'STAMP', type: 'STAMP', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 0.4, priority: 3, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'STAMP-01' },
    ],
    deadlines: [
      { name: 'VAT Return', frequency: 'MONTHLY', dueDay: 30, dueDescription: '30th of the following month', governingBody: 'ETA' },
      { name: 'Monthly WHT', frequency: 'MONTHLY', dueDay: 15, dueDescription: '15th of the following month', governingBody: 'ETA' },
      { name: 'Annual CIT Filing', frequency: 'ANNUALLY', dueMonth: 4, dueDay: 30, dueDescription: '4 months after financial year end', governingBody: 'ETA' },
    ],
    connectors: [
      { name: 'ETA e-Invoicing', provider: 'ETA', type: 'INVOICE_VALIDATION', baseUrl: 'https://api.einvoicing.eta.gov.eg', apiVersion: 'v2', authType: 'DIGITAL_SIGNATURE', isAvailable: true, isMandatory: true },
    ],
  },

  // ═══════════════════════════════════════════════
  // MOROCCO
  // ═══════════════════════════════════════════════
  {
    countryCode: 'MA',
    countryName: 'Morocco',
    currency: 'MAD',
    governingBody: 'DGI',
    invoicePrefix: 'FAC',
    qrRequired: false,
    electronicSignatureRequired: false,
    portalName: 'DGI e-Services',
    portalUrl: 'https://eservices.dgi.gov.ma',
    defaultVatRate: 20.0,
    defaultWhtRate: 10.0,
    defaultCorporateRate: 31.0,
    accountingStandard: 'IFRS',
    fiscalYearStart: '01-01',
    taxRules: [
      { name: 'Standard VAT', code: 'VAT_STANDARD', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 20.0, priority: 0, isStackable: true, appliesTo: 'BOTH', customerType: 'BOTH', reportingCode: 'VAT-01' },
      { name: 'Reduced VAT', code: 'VAT_REDUCED', type: 'VAT', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 14.0, priority: 0, isStackable: true, appliesTo: 'GOODS', customerType: 'BOTH', reportingCode: 'VAT-02' },
      { name: 'Withholding Tax', code: 'WHT', type: 'WITHHOLDING', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 10.0, priority: 1, isStackable: true, isWithholding: true, appliesTo: 'SERVICES', customerType: 'BUSINESS', reportingCode: 'WHT-01' },
      { name: 'Corporate Income Tax', code: 'CIT', type: 'CORPORATE', method: 'EXCLUSIVE', application: 'INVOICE_LEVEL', rate: 31.0, priority: 2, isStackable: false, appliesTo: 'BOTH', customerType: 'BUSINESS', reportingCode: 'CIT-01' },
    ],
    deadlines: [
      { name: 'VAT Declaration', frequency: 'MONTHLY', dueDay: 20, dueDescription: '20th of the following month', governingBody: 'DGI' },
      { name: 'Monthly WHT', frequency: 'MONTHLY', dueDay: 20, dueDescription: '20th of the following month', governingBody: 'DGI' },
      { name: 'Annual CIT Filing', frequency: 'ANNUALLY', dueMonth: 3, dueDay: 31, dueDescription: 'March 31st', governingBody: 'DGI' },
    ],
    connectors: [
      { name: 'DGI e-Services', provider: 'DGI', type: 'TAX_FILING', baseUrl: 'https://api.dgi.gov.ma', apiVersion: 'v1', authType: 'API_KEY', isAvailable: false, isMandatory: true },
    ],
  },
];

async function seedCompliance() {
  const existingCount = await prisma.complianceConfig.count();

  if (existingCount > 0) {
    console.log(`Seed: ${existingCount} compliance configs already exist, skipping.`);
    return;
  }

  for (const cfg of countryConfigs) {
    const { taxRules, deadlines, connectors, ...configData } = cfg;

    const config = await prisma.complianceConfig.create({
      data: {
        ...configData,
        deadlines: {
          create: (deadlines as Array<Record<string, unknown>>).map((d) => ({
            name: d.name as string,
            frequency: d.frequency as string,
            dueDay: (d.dueDay as number) ?? null,
            dueMonth: (d.dueMonth as number) ?? null,
            dueDescription: d.dueDescription as string,
            governingBody: d.governingBody as string,
            formName: (d.formName as string) || null,
            penaltyLate: (d.penaltyLate as number) ?? null,
            penaltyRate: (d.penaltyRate as number) ?? null,
          })),
        },
        connectors: {
          create: (connectors as Array<Record<string, unknown>> || []).map((c) => ({
            name: c.name as string,
            provider: c.provider as string,
            type: c.type as string,
            baseUrl: (c.baseUrl as string) || null,
            apiVersion: (c.apiVersion as string) || null,
            authType: (c.authType as string) || null,
            isAvailable: c.isAvailable as boolean,
            isMandatory: c.isMandatory as boolean,
            documentationUrl: (c.documentationUrl as string) || null,
          })),
        },
      },
    });

    // Create tax rules without compound links first
    for (const rule of taxRules as Array<Record<string, unknown>>) {
      const { compoundOnParent, ...ruleData } = rule;
      await prisma.taxRule.create({
        data: {
          ...ruleData as any,
          configId: config.id,
          type: ruleData.type as any,
          method: ruleData.method as any,
          application: ruleData.application as any,
          effectiveFrom: (ruleData.effectiveFrom as Date) || new Date(),
          effectiveTo: (ruleData.effectiveTo as Date) || null,
          exemptionCodes: (ruleData.exemptionCodes as string) || null,
        } as any,
      });
    }

    console.log(`  ✓ Seeded compliance config for ${cfg.countryName} (${cfg.countryCode})`);
  }

  // Two-phase: link compound taxes
  for (const cfg of countryConfigs) {
    const compoundRules = cfg.taxRules.filter((r: any) => r.compoundOnParent);
    for (const rule of compoundRules) {
      const config = await prisma.complianceConfig.findFirst({
        where: { countryCode: cfg.countryCode, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!config) continue;

      const savedRule = await prisma.taxRule.findFirst({
        where: { configId: config.id, code: rule.code },
      });
      const parentRule = await prisma.taxRule.findFirst({
        where: { configId: config.id, code: (rule as any).compoundOnParent },
      });
      if (savedRule && parentRule) {
        await prisma.taxRule.update({
          where: { id: savedRule.id },
          data: { compoundOnParent: { connect: { id: parentRule.id } } },
        });
      }
    }
  }

  console.log(`\n  ✓ Compliance seed complete: ${countryConfigs.length} countries`);
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@invoiceos.com';
  const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomUUID();
  const name = process.env.SEED_ADMIN_NAME || 'Admin User';

  console.log('\n📦 Seeding InvoiceOS database...\n');

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        businesses: {
          create: { name: `${name}'s Business`, country: 'NG' },
        },
      },
    });

    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log(`Admin user created:`);
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}\n`);
    } else {
      console.log(`Admin user ${email} created.`);
    }
  } else {
    console.log(`Admin user ${email} already exists.`);
  }

  await seedCompliance();

  console.log('\n✓ Seed complete.\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
