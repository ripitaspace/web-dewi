export const PAYROLL_SCHEMA = "ripitax-payroll-v1" as const;

export type RecipientType = "permanent" | "temporary-monthly" | "temporary-daily" | "pensioner" | "non-employee" | "event-participant" | "former-employee" | "foreign";
export type TaxMode = "deducted" | "gross-up";
export type PtkpStatus = "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3";

export type CompanyProfile = {
  name: string;
  address: string;
  taxId: string;
  signer: string;
  defaults: {
    healthEmployee: number;
    jhtEmployee: number;
    jpEmployee: number;
    jkkJkmEmployer: number;
  };
};

export type Employee = {
  id: string;
  name: string;
  employeeId: string;
  taxId: string;
  recipientType: RecipientType;
  taxMode: TaxMode;
  ptkp: PtkpStatus;
  treatyRate?: number;
};

export type NamedDeduction = { id: string; label: string; amount: number };

export type PaymentLine = {
  employeeId: string;
  salary: number;
  allowance: number;
  bonus: number;
  overtime: number;
  natura: number;
  employerJkkJkm: number;
  pensionEmployee: number;
  jhtEmployee: number;
  jpEmployee: number;
  healthEmployee: number;
  zakat: number;
  daysPaid: number;
  otherDeductions: NamedDeduction[];
  reviewFlags: { dtp: boolean; multipleEmployers: boolean; foreignCurrency: boolean; historicalCorrection: boolean };
};

export type PayRun = {
  id: string;
  period: string;
  paymentDate: string;
  items: PaymentLine[];
  selectedEmployeeIds: string[];
};

export type TaxResult = {
  gross: number;
  taxAllowance: number;
  pph21: number;
  employeeDeductions: number;
  takeHomePay: number;
  method: string;
  warnings: string[];
  trace: string[];
};

export type PayrollStore = {
  schema: typeof PAYROLL_SCHEMA;
  company: CompanyProfile;
  employees: Employee[];
  runs: PayRun[];
};
