import type { Studio, Recipient, Entry, Result, XmlDocument } from './model';
export function rupi(value: number): string;
export function createEngine(state: Studio): {
    person(id: string): Recipient | undefined;
    linesFor(id: string, month: number): Entry[];
    allLines(id: string): Entry[];
    inScope(r: Recipient, month: number): boolean;
    isPayroll(r: Recipient): boolean;
    category(r: Recipient): string;
    ter(r: Recipient, gross: number): {
        category: string;
        rate: number;
        lower: number;
        upper: number;
    };
    art17(amount: number): {
        tax: number;
        segments: {
            base: number;
            rate: number;
            tax: number;
        }[];
    };
    periodParts(r: Recipient, month: number): {
        gross: number;
        cash: number;
        cashDeduct: number;
        parts: Record<string, number>;
    };
    payrollResult(r: Recipient, month: number): Result | null;
    nonPayrollResults(r: Recipient, month: number): Result[];
    monthResults(r: Recipient, month: number): Result[];
    documentKind(r: Recipient, month: number): string;
    objectCode(r: Recipient, result?: Result): string;
    taxMonthSummary(r: Recipient, month: number): {
        rows: Result[];
        gross: number;
        cash: number;
        deductions: number;
        tax: number;
        netCash: number;
        employerBorneTax: number;
        issues: string[];
        docType: string;
    };
    companyErrors(): string[];
    personError(r: Recipient, type: string): string[];
    documentsForPeriod(): XmlDocument[];
    makeXml(type: string, docs: XmlDocument[]): string;
    xmlBatchStatus(docs: XmlDocument[], type: string): {
        list: XmlDocument[];
        count: number;
        issues: {
            name: string;
            text: string;
            id: string;
        }[];
        ready: boolean;
    };
    fileName(type: string): string;
};
