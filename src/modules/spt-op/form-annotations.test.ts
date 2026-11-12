import { describe, expect, it } from 'vitest';
import { annotateAnswer, annotateBox, annotateCell, annotateDigits, annotateResult, annotateTick, auditFormAnnotations, formSections } from './form-annotations';

describe('SPT OP form annotations', () => {
  it('identifies a direct identity input with its validation', () => {
    expect(annotateDigits(3, 3, 16)).toMatchObject({
      id: 'digits:p3:3', kind: 'input', status: 'mapped', editability: 'direct', dataPath: 'profile.tin', validation: '16 digit angka',
    });
  });

  it('keeps answers and calculated values distinct from editable inputs', () => {
    expect(annotateTick(3, 0)).toMatchObject({ kind: 'choice', dataPath: 'profile.periodType', editability: 'direct' });
    expect(annotateAnswer(3, 0)).toMatchObject({ kind: 'helper', editability: 'readonly', status: 'mapped' });
    expect(annotateResult(3, 1)).toMatchObject({ kind: 'calculated', editability: 'readonly', dataPath: 'result.net' });
    expect(annotateResult(3, 1).dependencies).toEqual(expect.arrayContaining(['tables.jobs', 'tables.nppn']));
  });

  it('uses a repeatable table path instead of inventing one annotation per row', () => {
    expect(annotateCell(7, 1, 2, 3)).toMatchObject({
      kind: 'table-cell', status: 'mapped', editability: 'direct', dataPath: 'tables.jobs[].gross',
    });
    expect(annotateCell(7, 1, 2, 5)).toMatchObject({ kind: 'calculated', editability: 'readonly', dataPath: 'tables.jobs[].net' });
  });

  it('marks template-only boxes as unmapped rather than editable', () => {
    expect(annotateBox(4, 0)).toMatchObject({ kind: 'static', status: 'unmapped', editability: 'none' });
  });

  it('has no duplicate IDs, inputs without validation, or results without sources', () => {
    expect(auditFormAnnotations().errors).toEqual([]);
  });

  it('uses the Induk reading order for editor sections', () => {
    expect(formSections.map(section => section.title)).toEqual([
      'Informasi SPT', 'A. Identitas Wajib Pajak', 'B. Sumber Penghasilan & Pembukuan', 'C. Pengurang & Perhitungan PPh Terutang', 'D. Kredit Pajak',
    ]);
  });
});
