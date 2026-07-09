import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDate,
  formatInstallmentProgress,
  formatMonth,
} from "./format";

describe("format helpers", () => {
  it("formats numeric values as BRL", () => {
    expect(formatCurrency(1234.5)).toBe("R$ 1.234,50");
    expect(formatCurrency("10")).toBe("R$ 10,00");
  });

  it("formats API dates and month strings", () => {
    expect(formatDate("2026-07-08T00:00:00.000Z")).toBe("08/07/2026");
    expect(formatMonth("2026-07")).toMatch(/jul/i);
  });

  it("formats installment progress as paid over total", () => {
    expect(formatInstallmentProgress(1, 2)).toBe("1/3");
  });
});
