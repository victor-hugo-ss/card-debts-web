import { describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";

import {
  invalidateInstallmentFlow,
  invalidatePurchaseFlow,
} from "./query-invalidations";
import { queryKeys } from "../api/endpoints";

function createQueryClientMock() {
  return {
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
  } as unknown as QueryClient & {
    invalidateQueries: ReturnType<typeof vi.fn>;
  };
}

function queryKeyMatcher(calls: unknown[][], key: readonly unknown[]) {
  return calls.some(([filters]) => {
    if (!filters || typeof filters !== "object" || !("queryKey" in filters)) {
      return false;
    }

    return JSON.stringify((filters as { queryKey: readonly unknown[] }).queryKey) === JSON.stringify(key);
  });
}

function familyMatcher(calls: unknown[][], family: string) {
  return calls.some(([filters]) => {
    if (!filters || typeof filters !== "object" || !("predicate" in filters)) {
      return false;
    }

    const predicate = (filters as {
      predicate: (query: { queryKey: readonly unknown[] }) => boolean;
    }).predicate;

    return predicate({ queryKey: [family, { page: 1 }] });
  });
}

describe("query invalidations", () => {
  it("invalidates purchase-related data after creating a purchase", async () => {
    const queryClient = createQueryClientMock();

    await invalidatePurchaseFlow(queryClient);

    const calls = queryClient.invalidateQueries.mock.calls;
    expect(familyMatcher(calls, "purchases")).toBe(true);
    expect(familyMatcher(calls, "installments")).toBe(true);
    expect(familyMatcher(calls, "friendPurchases")).toBe(true);
    expect(familyMatcher(calls, "friendInstallments")).toBe(true);
    expect(queryKeyMatcher(calls, queryKeys.dashboard)).toBe(true);
    expect(queryKeyMatcher(calls, queryKeys.friendSummary)).toBe(true);
  });

  it("invalidates installment-related data after changing payment status", async () => {
    const queryClient = createQueryClientMock();

    await invalidateInstallmentFlow(queryClient);

    const calls = queryClient.invalidateQueries.mock.calls;
    expect(familyMatcher(calls, "installments")).toBe(true);
    expect(familyMatcher(calls, "friendInstallments")).toBe(true);
    expect(familyMatcher(calls, "friendDebts")).toBe(true);
    expect(queryKeyMatcher(calls, queryKeys.dashboard)).toBe(true);
    expect(queryKeyMatcher(calls, queryKeys.friendSummary)).toBe(true);
  });
});
