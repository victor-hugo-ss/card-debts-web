import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  DataCard,
  EmptyState,
  ErrorMessage,
  KeyValueGrid,
  LoadingState,
  Panel,
  StatCard,
  Table,
} from "../../../shared/ui";
import { ApiError } from "../../../shared/api/api-client";
import { formatCurrency, formatDate } from "../../../shared/lib/format";
import { getFriendDebts, queryKeys } from "../../../shared/api/endpoints";

export function AdminFriendDebtsPage() {
  const { friendId = "" } = useParams();
  const debts = useQuery({
    queryKey: queryKeys.friendDebts(friendId),
    queryFn: () => getFriendDebts(friendId),
    enabled: Boolean(friendId),
  });
  const error =
    debts.error instanceof ApiError
      ? debts.error.message
      : debts.error
        ? "Não foi possível carregar as dívidas."
        : undefined;

  if (debts.isLoading) return <LoadingState>Carregando dívidas...</LoadingState>;

  return (
    <div className="grid gap-4">
      <div>
        <Link className="focus-ring mb-2 inline-flex items-center gap-2 rounded-md text-sm font-medium text-blue-700" to="/admin/friends">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <h1 className="text-xl font-bold text-slate-950">Dívidas do amigo</h1>
        <p className="text-sm text-slate-500">{debts.data?.friend.name ?? "Carregando..."}</p>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total pendente" value={formatCurrency(debts.data?.totalPending)} tone="warn" />
        <StatCard label="Parcelas pendentes" value={debts.data?.installments.length ?? 0} />
        <StatCard label="E-mail" value={<span className="text-base">{debts.data?.friend.email ?? "-"}</span>} />
      </div>

      <Panel title="Parcelas pendentes">
        {!debts.data?.installments.length ? (
          <EmptyState>Nenhuma dívida pendente.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {debts.data.installments.map((installment) => (
                <DataCard
                  key={installment.id}
                  title={installment.purchase.description}
                  meta={`${installment.purchase.creditCard.name} · ${formatDate(installment.dueDate)}`}
                  badge={<p className="font-bold text-slate-950">{formatCurrency(installment.amount)}</p>}
                >
                  <KeyValueGrid
                    items={[
                      { label: "Parcela", value: installment.number, align: "right" },
                    ]}
                  />
                </DataCard>
              ))}
            </div>
            <div className="hidden md:block">
              <Table headings={["Vencimento", "Compra", "Cartão", "Parcela", "Valor"]}>
                {debts.data.installments.map((installment) => (
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
