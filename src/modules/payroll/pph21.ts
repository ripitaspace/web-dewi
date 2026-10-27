import type { Employee, PaymentLine, PtkpStatus, TaxResult } from "./types";

export const PPH21_RULES_2026 = {
  version: "PP 58 Tahun 2023 · PMK 168 Tahun 2023",
  effectiveFrom: "2024-01-01",
  reviewedFor: 2026,
  sources: ["https://jdih.kemenkeu.go.id/dok/pp-58-tahun-2023/view", "https://jdih.kemenkeu.go.id/dok/pmk-168-tahun-2023/summary"],
} as const;

const PTKP: Record<PtkpStatus, number> = { "TK/0": 54_000_000, "TK/1": 58_500_000, "TK/2": 63_000_000, "TK/3": 67_500_000, "K/0": 58_500_000, "K/1": 63_000_000, "K/2": 67_500_000, "K/3": 72_000_000 };
const CATEGORY: Record<PtkpStatus, "A" | "B" | "C"> = { "TK/0": "A", "TK/1": "A", "TK/2": "B", "TK/3": "B", "K/0": "A", "K/1": "B", "K/2": "B", "K/3": "C" };
const TER: Record<"A" | "B" | "C", { upper: number[]; rate: number[] }> = {
  A: { upper: [5_400_000,5_650_000,5_950_000,6_300_000,6_750_000,7_500_000,8_550_000,9_650_000,10_050_000,10_350_000,10_700_000,11_000_000,11_600_000,12_500_000,13_750_000,15_100_000,16_950_000,19_750_000,24_150_000,26_450_000,28_000_000,30_050_000,32_400_000,35_400_000,39_100_000,43_850_000,47_800_000,51_400_000,56_300_000,62_200_000,68_600_000,77_500_000,89_000_000,103_000_000,125_000_000,157_000_000,206_000_000,337_000_000,454_000_000,550_000_000,695_000_000,910_000_000,1_400_000_000,Infinity], rate: [0,.0025,.005,.0075,.01,.0125,.015,.0175,.02,.0225,.025,.03,.035,.04,.05,.06,.07,.08,.09,.10,.11,.12,.13,.14,.15,.16,.17,.18,.19,.20,.21,.22,.23,.24,.25,.26,.27,.28,.29,.30,.31,.32,.33,.34] },
  B: { upper: [6_200_000,6_500_000,6_850_000,7_300_000,9_200_000,10_750_000,11_250_000,11_600_000,12_600_000,13_600_000,14_950_000,16_400_000,18_450_000,21_850_000,26_000_000,27_700_000,29_350_000,31_450_000,33_950_000,37_100_000,41_100_000,45_800_000,49_500_000,53_800_000,58_500_000,64_000_000,71_000_000,80_000_000,93_000_000,109_000_000,129_000_000,163_000_000,211_000_000,374_000_000,459_000_000,555_000_000,704_000_000,957_000_000,1_405_000_000,Infinity], rate: [0,.0025,.005,.0075,.01,.015,.02,.025,.03,.04,.05,.06,.07,.08,.09,.10,.11,.12,.13,.14,.15,.16,.17,.18,.19,.20,.21,.22,.23,.24,.25,.26,.27,.28,.29,.30,.31,.32,.33,.34] },
  C: { upper: [6_600_000,6_950_000,7_350_000,7_800_000,8_850_000,9_800_000,10_950_000,11_200_000,12_050_000,12_950_000,14_150_000,15_550_000,17_000_000,19_500_000,22_700_000,26_600_000,28_100_000,30_100_000,32_600_000,35_400_000,38_900_000,43_000_000,47_400_000,51_200_000,55_800_000,60_400_000,66_700_000,74_500_000,83_200_000,95_600_000,110_000_000,134_000_000,169_000_000,221_000_000,390_000_000,463_000_000,561_000_000,709_000_000,965_000_000,1_419_000_000,Infinity], rate: [0,.0025,.005,.0075,.01,.0125,.015,.0175,.02,.03,.04,.05,.06,.07,.08,.09,.10,.11,.12,.13,.14,.15,.16,.17,.18,.19,.20,.21,.22,.23,.24,.25,.26,.27,.28,.29,.30,.31,.32,.33,.34] },
};
const ARTICLE_17 = [[60_000_000,.05],[250_000_000,.15],[500_000_000,.25],[5_000_000_000,.30],[Infinity,.35]] as const;
const DAILY_TER = [[450_000,0],[2_500_000,.005],[10_000_000,.01],[20_000_000,.015],[Infinity,.025]] as const;

function round(value: number) { return Math.round(Math.max(0, value)); }
function article17(pkp: number) { let prior = 0; let tax = 0; for (const [cap, rate] of ARTICLE_17) { const taxable = Math.max(0, Math.min(pkp, cap) - prior); tax += taxable * rate; prior = cap; if (pkp <= cap) break; } return round(tax); }
function terMonthly(ptkp: PtkpStatus, gross: number) { const table = TER[CATEGORY[ptkp]]; return table.rate[table.upper.findIndex((upper) => gross <= upper)] ?? 0; }
function income(line: PaymentLine) { return line.salary + line.allowance + line.bonus + line.overtime + line.natura + line.employerJkkJkm; }
function flags(line: PaymentLine) { return Object.entries(line.reviewFlags).filter(([, active]) => active).map(([name]) => ({ dtp: "Fasilitas PPh 21 DTP", multipleEmployers: "lebih dari satu pemberi kerja", foreignCurrency: "mata uang asing", historicalCorrection: "koreksi historis" })[name as keyof PaymentLine["reviewFlags"]]); }

export function createEmptyPayment(employeeId: string): PaymentLine {
  return { employeeId, salary: 0, allowance: 0, bonus: 0, overtime: 0, natura: 0, employerJkkJkm: 0, pensionEmployee: 0, jhtEmployee: 0, jpEmployee: 0, healthEmployee: 0, zakat: 0, daysPaid: 1, otherDeductions: [], reviewFlags: { dtp: false, multipleEmployers: false, foreignCurrency: false, historicalCorrection: false } };
}

export function calculatePph21(employee: Employee, line: PaymentLine, context: { priorGross?: number; priorPph?: number; priorTaxDeductions?: number; monthsWorked?: number; isFinalPeriod?: boolean } = {}): TaxResult {
  const warnings = flags(line);
  const calculate = (gross: number) => {
    if (employee.recipientType === "foreign") return { tax: round(gross * ((employee.treatyRate ?? 20) / 100)), method: `PPh 26 ${employee.treatyRate ?? 20}%`, trace: ["Tarif PPh 26 default 20%; gunakan tarif P3B hanya bila dokumen tersedia."] };
    if (employee.recipientType === "temporary-daily") {
      const perDay = gross / Math.max(1, line.daysPaid);
      const rate = DAILY_TER.find(([upper]) => perDay <= upper)?.[1] ?? 0;
      return perDay > 2_500_000 ? { tax: article17(Math.floor((gross * .5) / 1000) * 1000), method: "50% bruto × tarif Pasal 17", trace: ["Penghasilan harian di atas Rp2,5 juta memakai dasar 50% bruto."] } : { tax: round(gross * rate), method: "TER harian", trace: [`TER harian ${(rate * 100).toLocaleString("id-ID")}% dari bruto.`] };
    }
    if (employee.recipientType === "temporary-monthly") { const rate = terMonthly(employee.ptkp, gross); return { tax: round(gross * rate), method: "TER bulanan", trace: [`TER kategori ${CATEGORY[employee.ptkp]} ${(rate * 100).toLocaleString("id-ID")}% dari bruto.`] }; }
    if (employee.recipientType === "non-employee") return { tax: article17(Math.floor((gross * .5) / 1000) * 1000), method: "50% bruto × tarif Pasal 17", trace: ["Bukan pegawai memakai dasar pengenaan 50% penghasilan bruto."] };
    if (employee.recipientType === "event-participant" || employee.recipientType === "former-employee") return { tax: article17(Math.floor(gross / 1000) * 1000), method: "Bruto × tarif Pasal 17", trace: ["Tarif Pasal 17 diterapkan atas dasar pengenaan periode ini."] };
    const taxableDeductions = line.pensionEmployee + line.jhtEmployee + line.jpEmployee + line.zakat;
    if (context.isFinalPeriod) {
      const annualGross = (context.priorGross ?? 0) + gross;
      const expenses = Math.min(round(annualGross * .05), 500_000 * Math.max(1, context.monthsWorked ?? 12));
      const pkp = Math.max(0, Math.floor((annualGross - expenses - (context.priorTaxDeductions ?? 0) - taxableDeductions - PTKP[employee.ptkp]) / 1000) * 1000);
      const annualTax = article17(pkp);
      return { tax: annualTax - (context.priorPph ?? 0), method: "Masa pajak terakhir · Pasal 17", trace: [`PKP ${pkp.toLocaleString("id-ID")}; PPh periode sebelumnya dikurangkan.`] };
    }
    const rate = terMonthly(employee.ptkp, gross);
    return { tax: round(gross * rate), method: "TER bulanan", trace: [`TER kategori ${CATEGORY[employee.ptkp]} ${(rate * 100).toLocaleString("id-ID")}% dari bruto.`] };
  };
  const initialGross = income(line);
  let taxAllowance = 0;
  let outcome = calculate(initialGross);
  if (employee.taxMode === "gross-up") for (let step = 0; step < 8; step += 1) { const next = calculate(initialGross + taxAllowance); if (Math.abs(next.tax - taxAllowance) < 1) { outcome = next; taxAllowance = next.tax; break; } taxAllowance = next.tax; outcome = next; }
  const gross = initialGross + taxAllowance;
  const manual = line.otherDeductions.reduce((total, deduction) => total + Math.max(0, deduction.amount), 0);
  const employeeDeductions = line.pensionEmployee + line.jhtEmployee + line.jpEmployee + line.healthEmployee + line.zakat + manual + outcome.tax;
  if (employee.recipientType === "foreign" && !employee.treatyRate) warnings.push("Tarif PPh 26 20% digunakan karena tarif P3B belum diisi.");
  if (warnings.length) warnings.unshift("Perhitungan ini perlu review manual sebelum dipakai untuk pemotongan nyata: " + warnings.join(", ") + ".");
  return { gross: round(gross), taxAllowance: round(taxAllowance), pph21: round(outcome.tax), employeeDeductions: round(employeeDeductions), takeHomePay: round(gross - employeeDeductions), method: outcome.method, warnings, trace: outcome.trace };
}
