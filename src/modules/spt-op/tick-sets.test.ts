import { describe, expect, it } from 'vitest';
import { fresh } from './model';
import { ticks, tickSets } from './coretax-map';

describe('tickSets', () => {
  it('setiap aksi klik menyalakan centangnya sendiri', () => {
    for (const [sheet, map] of Object.entries(tickSets)) for (const [index, set] of Object.entries(map)) {
      const draft = fresh();
      draft[set.group][set.key] = set.value;
      expect(ticks[Number(sheet)][Number(index)](draft), `sheet ${sheet} tick ${index}`).toBe(true);
    }
  });
});
