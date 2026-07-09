import { useQuery } from "@tanstack/react-query";

import {
  DataCard,
  EmptyState,
  ErrorMessage,
  KeyValueGrid,
  LoadingState,
  PageHeader,
  Panel,
  Table,
} from "../../../shared/ui";
import { ApiError } from "../../../shared/api/api-client";
import { formatCurrency, formatDate } from "../../../shared/lib/format";
import { listFriendPurchases, queryKeys } from "../../../shared/api/endpoints";

export function FriendPurchasesPage() {
  const purchases = useQuery({
    queryKey: queryKeys.friendPurchases,
    queryFn: listFriendPurchases,
  });
  const error =
    purchases.error instanceof ApiError
      ? purchases.error.message
      : purchases.error
        ? "Não foi possível carregar suas compras."
        : undefined;

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Minhas compras"
        description="Compras feitas em cartões do administrador."
      />

      <Panel title="Compras">
        <ErrorMessage className="mb-4" message={error} />
        {purchases.isLoading ? (
          <LoadingState>Carregando compras...</LoadingState>
        ) : !purchases.data?.length ? (
          <EmptyState>Nenhuma compra encontrada.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {purchases.data.map((purchase) => (
                <DataCard
                  key={purchase.id}
                  title={purchase.description}
                  meta={purchase.creditCard.name}
                  badge={<p className="font-bold text-slate-950">{formatCurrency(purchase.amount)}</p>}
                >
                  <KeyValueGrid
                    items={[
                      { label: "Data", value: formatDate(purchase.purchaseDate) },
                      { label: "Parcelas", value: `${purchase.installmentsCount}x` },
                    ]}
                  />
                </DataCard>
              ))}
            </div>
            <div className="hidden md:block">
              <Table headings={["Compra", "Cartão", "Data", "Valor", "Parcelas"]}>
                {purchases.data.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-3 py-3 font-medium text-slate-950">{purchase.description}</td>
                    <td className="px-3 py-3">{purchase.creditCard.name}</td>
                    <td className="px-3 py-3">{formatDate(purchase.purchaseDate)}</td>
                    <td className="px-3 py-3 font-semibold">{formatCurrency(purchase.amount)}</td>
                    <td className="px-3 py-3">{purchase.installmentsCount}x</td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
