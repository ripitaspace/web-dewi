/** Returns the visible labels of designed F4 sheets that would spill onto another page. */
export function overflowingPrintSheets(root: HTMLElement | null): string[] {
  if (!root) return [];

  return Array.from(root.querySelectorAll<HTMLElement>('.spt-coretax .sheet'))
    .filter(sheet => sheet.scrollHeight > sheet.clientHeight + 2)
    .map(sheet => sheet.getAttribute('aria-label') || `Sheet ${sheet.dataset.sheet || '?'}`);
}
