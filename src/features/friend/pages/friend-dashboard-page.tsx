import { useQuery } from "@tanstack/react-query";

import {
  DataCard,
  EmptyState,
  ErrorMessage,
  KeyValueGrid,
  LoadingState,
  PageHeader,
  Panel,
  StatCard,
  Table,
} from "../../../shared/ui";
import { formatCurrency, formatDate } from "../../../shared/lib/format";
import {
  getFriendSummary,
  listFriendInstallments,
  queryKeys,
} from "../../../shared/api/endpoints";

export function FriendDashboardPage() {
  const summary = useQuery({
    queryKey: queryKeys.friendSummary,
    queryFn: getFriendSummary,
  });
  const pending = useQuery({
    queryKey: queryKeys.friendInstallments({ status: "PENDING" }),
    queryFn: () => listFriendInstallments({ status: "PENDING" }),
  });
  const isLoading = summary.isLoading || pending.isLoading;
  const error =
    summary.error || pending.error
      ? "Não foi possível carregar o dashboard."
      : undefined;

  if (isLoading) return <LoadingState>Carregando dashboard...</LoadingState>;

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Resumo"
        description="Acompanhe suas compras e parcelas em aberto."
      />

      <ErrorMessage message={error} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Dívida total" value={formatCurrency(summary.data?.totalDebt)} />
        <StatCard label="Pendente" value={formatCurrency(summary.data?.pendingDebt)} tone="warn" />
        <StatCard label="Pago" value={formatCurrency(summary.data?.paidDebt)} tone="good" />
        <StatCard label="Parcelas pendentes" value={summary.data?.pendingInstallments ?? 0} />
        <StatCard label="Parcelas pagas" value={summary.data?.paidInstallments ?? 0} />
      </div>

      <Panel title="Próximas parcelas pendentes">
        {!pending.data?.length ? (
          <EmptyState>Nenhuma parcela pendente.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {pending.data.slice(0, 8).map((installment) => (
                <DataCard
                  key={installment.id}
                  title={installment.purchase.description}
                  meta={installment.purchase.creditCard.name}
                  badge={<p className="font-bold text-slate-950">{formatCurrency(installment.amount)}</p>}
                >
                  <KeyValueGrid
                    items={[
                      { label: "Vencimento", value: formatDate(installment.dueDate) },
                      { label: "Parcela", value: installment.number, align: "right" },
                    ]}
                  />
                </DataCard>
              ))}
            </div>
            <div className="hidden md:block">
              <Table headings={["Vencimento", "Compra", "Cartão", "Parcela", "Valor"]}>
                {pending.data.slice(0, 8).map((installment) => (
                  <tr key={installment.id}>
                    <td className="px-3 py-3">{formatDate(installment.dueDate)}</td>
                    <td className="px-3 py-3 font-medium text-slate-950">{installment.purchase.description}</td>
                    <td className="px-3 py-3">{installment.purchase.creditCard.name}</td>
                    <td className="px-3 py-3">{installment.number}</td>
                    <td className="px-3 py-3 font-semibold">{formatCurrency(installment.amount)}</td>
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
