export type TaxMethod = "gross" | "gross_up" | "employer_borne";

export type Recipient = {
    id: string;
    employeeId: string;
    name: string;
    tin: string;
    tku: string;
    kind: string;
    residency: string;
    citizenship: string;
    ptkp: string;
    sector: string;
    startMonth: number;
    endMonth: number;
    subject: string;
    position: string;
    rank: string;
    nip: string;
    passport: string;
    kitas: string;
    country: string;
    address: string;
    dob: string;
    birthCity: string;
    foreignTin: string;
    receiptNo: string;
    facility: string;
    taxObject: string;
    // Kept for the Coretax A1 adapter and legacy v2 backups. New logic uses taxMethod.
    grossUp: "No" | "Yes";
    taxMethod: TaxMethod;
    workForSecondEmployer: string;
    previousSlip: string;
    annualComplete: boolean;
    whStatus: string;
    note: string;
};
export type Entry = {
    id: string;
    recipientId: string;
    month: number;
    comp: string;
    amount: number;
    description: string;
    documentType: string;
    documentNo: string;
    documentDate: string;
    withholdingDate: string;
    days: number;
    equalDaily: boolean;
    excludedLabor: number;
    excludedMaterial: number;
    proof: boolean;
};
export type Studio = {
    schema: 'ripitax-pph21-local-v2';
    company: {
        name: string;
        tin: string;
        tku: string;
        year: number;
        month: number;
        withholdingDate: string;
    };
    recipients: Recipient[];
    entries: Entry[];
    nextId: number;
};
export type Result = {
    recipientId: string;
    entryId?: string;
    month: number;
    kind: string;
    docType: string;
    gross: number;
    cash: number;
    deductions: number;
    tax: number;
    netCash: number;
    employerBorneTax?: number;
    rate: number | null;
    method: string;
    trace: string[];
    issues: string[];
    parts: Record<string, number>;
    annual?: {
        gross: number;
        annualTax: number;
        prior: number;
        tax: number;
        components?: Record<string, number>;
    };
    entry?: Entry;
};
export type XmlDocument = {
    type: string;
    recipientId: string;
    entry: Entry | null;
    result: Result;
    fields: [
        string,
        unknown
    ][];
    errors: string[];
};
