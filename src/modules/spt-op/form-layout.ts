import { catalog, type Draft } from './model';
import { capacityOf } from './coretax-map';

export function activeRows(draft: Draft, key: string) {
    return (draft.tables[key] || []).filter(row => !row.disposed);
}
export function pageCount(draft: Draft, page: number) {
    return Math.max(1, ...Object.keys(catalog.LAYOUTS)
        .filter(key => catalog.tables[key]?.page === page)
        .map(key => Math.ceil(activeRows(draft, key).length / capacityOf(key))));
}
export function pageRows(draft: Draft, key: string, part: number) {
    const capacity = capacityOf(key);
    return activeRows(draft, key).slice(part * capacity, (part + 1) * capacity);
}
