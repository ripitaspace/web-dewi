import { describe, expect, it } from 'vitest';
import { descendantIds, navigationTree, type NavigationNode } from './navigation-tree';

function findNode(nodes: NavigationNode[], id: string): NavigationNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNode(node.children || [], id);
    if (child) return child;
  }
}

describe('SPT OP navigation metadata', () => {
  it('opens every branch by default without duplicate node IDs', () => {
    const ids = descendantIds(navigationTree);
    expect(ids).toContain('induk');
    expect(ids).toContain('lampiran-1');
    expect(ids).toContain('data-xml');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('maps A → NIK/NPWP to the identity editor on page 3', () => {
    expect(findNode(navigationTree, 'profile-tin')?.target).toEqual({ section: 'profile', page: 3, focusId: 'tin' });
  });

  it('keeps table columns with their own editor and item count source', () => {
    const cash = findNode(navigationTree, 'table-cash');
    expect(cash).toMatchObject({ target: { section: 'cash', page: 5 }, countKey: 'cash' });
    expect(cash?.children?.map(column => column.label)).toEqual(expect.arrayContaining(['1. Kode harta', '2. Nomor akun']));
  });
});
