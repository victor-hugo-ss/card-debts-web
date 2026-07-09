import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "../api/endpoints";

function invalidateFamily(queryClient: QueryClient, family: string) {
  return queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === family,
  });
}

export async function invalidatePurchaseFlow(queryClient: QueryClient) {
  await Promise.all([
    invalidateFamily(queryClient, queryKeys.purchases()[0]),
    invalidateFamily(queryClient, queryKeys.installments()[0]),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    queryClient.invalidateQueries({ queryKey: queryKeys.friendSummary }),
    invalidateFamily(queryClient, queryKeys.friendPurchases[0]),
    invalidateFamily(queryClient, queryKeys.friendInstallments()[0]),
  ]);
}

export async function invalidateInstallmentFlow(queryClient: QueryClient) {
  await Promise.all([
    invalidateFamily(queryClient, queryKeys.installments()[0]),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    queryClient.invalidateQueries({ queryKey: queryKeys.friendSummary }),
    invalidateFamily(queryClient, queryKeys.friendInstallments()[0]),
    invalidateFamily(queryClient, queryKeys.friendDebts("")[0]),
  ]);
}
