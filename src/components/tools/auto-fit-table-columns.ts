export type AutoFitColumn = {
  min?: number;
  max?: number;
};

function numberAttr(element: Element, name: string) {
  const value = Number(element.getAttribute(name));
  return Number.isFinite(value) ? value : undefined;
}

function horizontalBox(style: CSSStyleDeclaration) {
  return [style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth]
    .reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);
}

function textWidth(text: string, style: CSSStyleDeclaration, context: CanvasRenderingContext2D) {
  context.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return context.measureText(text).width;
}

function controlWidth(control: HTMLInputElement | HTMLSelectElement, context: CanvasRenderingContext2D) {
  const style = getComputedStyle(control);
  const text = control instanceof HTMLSelectElement
    ? control.options[control.selectedIndex]?.text || ""
    : control.value || control.placeholder || "";
  const selectArrow = control instanceof HTMLSelectElement ? 26 : 0;
  return textWidth(text, style, context) + horizontalBox(style) + selectArrow;
}

function cellWidth(cell: HTMLTableCellElement, context: CanvasRenderingContext2D) {
  const style = getComputedStyle(cell);
  const controls = Array.from(cell.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input:not([type=checkbox]), select"));
  const actionGroup = cell.querySelector<HTMLElement>("[class*='rowActions']");
  const badge = cell.querySelector<HTMLElement>("[class*='badge']");

  if (controls.length) return Math.max(...controls.map(control => controlWidth(control, context))) + horizontalBox(style);
  if (actionGroup) return actionGroup.getBoundingClientRect().width + horizontalBox(style);
  if (badge) return badge.getBoundingClientRect().width + horizontalBox(style);
  return textWidth(cell.textContent?.trim() || "", style, context) + horizontalBox(style);
}

/** Applies Excel-like content widths to a table that contains a matching colgroup. */
export function autoFitTableColumns(tableElement: HTMLTableElement) {
  const columns = Array.from(tableElement.querySelectorAll<HTMLTableColElement>("colgroup > col"));
  const headers = Array.from(tableElement.querySelectorAll<HTMLTableCellElement>("thead th"));
  if (!columns.length || columns.length !== headers.length) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  columns.forEach((column, index) => {
    const header = headers[index];
    const headerStyle = getComputedStyle(header);
    const headerWidth = textWidth(header.textContent?.trim() || "", headerStyle, context) + horizontalBox(headerStyle);
    const cells = Array.from(tableElement.querySelectorAll<HTMLTableCellElement>(`tbody tr > td:nth-child(${index + 1})`));
    const contentWidth = cells.length ? Math.max(...cells.map(cell => cellWidth(cell, context))) : 0;
    const minimum = numberAttr(column, "data-autofit-min") ?? 72;
    const maximum = numberAttr(column, "data-autofit-max") ?? 480;
    const width = Math.min(maximum, Math.max(minimum, Math.ceil(headerWidth), Math.ceil(contentWidth)));
    column.style.width = `${width}px`;
  });
}
