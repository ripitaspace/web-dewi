import { catalog, type Draft } from './model';
// Coordinates are copied from the supplied HTML, in the SVG's native units.
// Additional fields must be checked against the official form before mapping.
export type FormField = [
    key: string,
    x: number,
    y: number,
    width: number
];
export const identityFields: Record<number, FormField[]> = {
    3: [['year', 58, 117, 85], ['tin', 88, 162, 206], ['name', 88, 175, 206], ['idNumber', 88, 204, 205], ['phone', 88, 217, 205], ['email', 88, 232, 205], ['spouseTin', 349, 218, 213], ['ptkp', 333, 667, 62]],
    4: [['tin', 115, 826, 205], ['name', 116, 839, 205]],
};
export const resultFields: Record<number, [
    string,
    number
][]> = {
    3: [['jobs', 261], ['business', 501], ['other', 513], ['foreign', 543], ['net', 593], ['ded', 605], ['afterDed', 655], ['pt', 667], ['pk', 679], ['rawTax', 691], ['relief', 703], ['tax', 739], ['credit', 774], ['p25Paid', 805], ['p25STP', 817], ['foreignRefund', 831]],
    4: [['balance', 92], ['deferral', 123], ['payable', 144], ['previousBalance', 187], ['amended', 201], ['p25Next', 302], ['debt', 456], ['final', 469], ['exempt', 509]],
};
export function activeRows(draft: Draft, key: string) {
    return (draft.tables[key] || []).filter(row => !row.disposed);
}
export function pageCount(draft: Draft, page: number) {
    return Math.max(1, ...Object.entries(catalog.LAYOUTS)
        .filter(([key]) => catalog.tables[key]?.page === page)
        .map(([key, layout]) => Math.ceil(activeRows(draft, key).length / layout.n)));
}
export function pageRows(draft: Draft, key: string, part: number) {
    const capacity = catalog.LAYOUTS[key].n;
    return activeRows(draft, key).slice(part * capacity, (part + 1) * capacity);
}
