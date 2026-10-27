import { describe, expect, it } from "vitest";
import { calculatePph21, createEmptyPayment } from "./pph21";
import type { Employee } from "./types";

const employee: Employee = { id: "e-1", name: "Tuan R", employeeId: "EMP-1", taxId: "", recipientType: "permanent", taxMode: "deducted", ptkp: "K/0" };

describe("calculatePph21", () => {
  it("uses TER monthly for a permanent employee outside the final period", () => {
    const line = { ...createEmptyPayment(employee.id), salary: 10_000_000 };
    expect(calculatePph21(employee, line).pph21).toBe(200_000);
  });
  it("uses 50% of gross for a non-employee", () => {
    const result = calculatePph21({ ...employee, recipientType: "non-employee" }, { ...createEmptyPayment(employee.id), salary: 10_000_000 });
    expect(result.pph21).toBe(250_000);
  });
  it("adds a tax allowance for gross-up", () => {
    const result = calculatePph21({ ...employee, taxMode: "gross-up" }, { ...createEmptyPayment(employee.id), salary: 10_000_000 });
    expect(result.taxAllowance).toBeGreaterThan(0);
    expect(result.takeHomePay).toBe(10_000_000);
  });
});
