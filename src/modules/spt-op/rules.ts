import { rules2025 } from './rules-2025';

/** Rules are registered by tax year; drafts remain local preparations until verified. */
export interface AnnualRuleSet {
  year: string;
  version: string;
  annualReturnVerified: boolean;
  sources: Record<string, { title: string; url?: string; scope: string; checkedAt?: string }>;
  pending: readonly string[];
}

export const annualRuleSets: Record<string, AnnualRuleSet> = { 2025: rules2025 };

export function ruleSetFor(year: string): AnnualRuleSet | null {
  return annualRuleSets[year] || null;
}

export function ruleStatus(year: string) {
  const rules = ruleSetFor(year);
  if (!rules) return { rules, ready: false, message: `Tahun pajak ${year || 'belum diisi'} belum memiliki ruleset DJP yang terdaftar.` };
  if (!rules.annualReturnVerified) return { rules, ready: false, message: `Ruleset ${year} masih berupa rekap kerja; perhitungan SPT tahunan dan pelaporan ditahan.` };
  return { rules, ready: true, message: `Ruleset ${year} telah diverifikasi untuk SPT tahunan.` };
}
