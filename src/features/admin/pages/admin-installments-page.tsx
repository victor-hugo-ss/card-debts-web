import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, RotateCcw, Search } from "lucide-react";
import { useState } from "react";

import {
  Button,
  DataCard,
  EmptyState,
  ErrorMessage,
  Field,
  KeyValueGrid,
  LoadingState,
  PageHeader,
  Pagination,
  Panel,
  Select,
  StatusBadge,
  Table,
} from "../../../shared/ui";
import { ApiError } from "../../../shared/api/api-client";
import { formatCurrency, formatDate } from "../../../shared/lib/format";
import { invalidateInstallmentFlow } from "../../../shared/lib/query-invalidations";
import {
  listCreditCards,
  listFriends,
  listInstallments,
  payInstallment,
  queryKeys,
  unpayInstallment,
} from "../../../shared/api/endpoints";
import { queryClient } from "../../../shared/lib/query-client";
import type { InstallmentStatus } from "../../../shared/api/types";

function getQueryError(...errors: unknown[]) {
  const error = errors.find(Boolean);
  return error instanceof ApiError
    ? error.message
    : error
      ? "Não foi possível carregar os dados"
      : undefined;
}

export function AdminInstallmentsPage() {
  const [filters, setFilters] = useState<{ page: number; perPage: number; status: InstallmentStatus | ""; friendId: string; creditCardId: string; month: string }>({
    page: 1,
    perPage: 10,
    status: "",
    friendId: "",
    creditCardId: "",
    month: "",
  });
  const friends = useQuery({ queryKey: queryKeys.friends, queryFn: listFriends });
  const cards = useQuery({ queryKey: queryKeys.creditCards, queryFn: listCreditCards });
  const installments = useQuery({
    queryKey: queryKeys.installments(filters),
    queryFn: () => listInstallments(filters),
  });

  const updatePayment = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InstallmentStatus }) =>
      status === "PAID" ? unpayInstallment(id) : payInstallment(id),
    onSuccess: async () => {
      await invalidateInstallmentFlow(queryClient);
    },
  });

  const queryError = getQueryError(friends.error, cards.error, installments.error);
  const mutationError =
    updatePayment.error instanceof ApiError
      ? updatePayment.error.message
      : updatePayment.error
        ? "Não foi possível atualizar a parcela"
        : undefined;
  const isLoadingOptions = friends.isLoading || cards.isLoading;
  const isLoadingInstallments = installments.isLoading || installments.isFetching;

  function handlePaymentToggle(id: string, status: InstallmentStatus) {
    const message =
      status === "PAID"
        ? "Deseja desfazer o pagamento desta parcela?"
        : "Deseja marcar esta parcela como paga?";

    if (window.confirm(message)) {
      updatePayment.mutate({ id, status });
    }
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Parcelas"
        description="Filtre vencimentos e controle pagamentos."
      />

      <Panel title="Parcelas cadastradas" description="Acompanhe o status de pagamento por vencimento, compra, amigo e cartão.">
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[160px_1fr_1fr_180px_auto]">
          <Select label="Status" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, status: event.target.value as InstallmentStatus | "" }))}>
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Paga</option>
          </Select>
          <Select label="Amigo" value={filters.friendId} disabled={friends.isLoading} onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, friendId: event.target.value }))}>
            <option value="">Todos</option>
            {friends.data?.map((friend) => <option key={friend.id} value={friend.id}>{friend.name}</option>)}
          </Select>
          <Select label="Cartão" value={filters.creditCardId} disabled={cards.isLoading} onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, creditCardId: event.target.value }))}>
            <option value="">Todos</option>
            {cards.data?.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}
          </Select>
          <Field label="Mês" type="month" value={filters.month} onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, month: event.target.value }))} />
          <Button className="self-end" variant="secondary" disabled={isLoadingOptions} onClick={() => setFilters({ page: 1, perPage: 10, status: "", friendId: "", creditCardId: "", month: "" })}>
            <Search size={16} />
            Limpar
          </Button>
        </div>

        <ErrorMessage className="mb-4" message={queryError ?? mutationError} />

        {installments.isLoading ? (
          <LoadingState>Carregando parcelas...</LoadingState>
        ) : !installments.data?.data.length ? (
          <EmptyState>Nenhuma parcela encontrada.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {installments.data.data.map((installment) => (
                <DataCard
                  key={installment.id}
                  title={installment.purchase.description}
                  meta={`${installment.purchase.friend.name} · ${installment.purchase.creditCard.name}`}
                  badge={<StatusBadge status={installment.status} />}
                  action={
                    <Button
                      variant={installment.status === "PAID" ? "secondary" : "primary"}
                      className="w-full"
                      disabled={updatePayment.isPending}
                      onClick={() => handlePaymentToggle(installment.id, installment.status)}
                    >
                      {installment.status === "PAID" ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                      {updatePayment.isPending ? "Atualizando..." : installment.status === "PAID" ? "Desfazer" : "Pagar"}
                    </Button>
                  }
                >
                  <KeyValueGrid
                    items={[
                      { label: "Vencimento", value: formatDate(installment.dueDate) },
                      { label: "Parcela", value: installment.number },
                      { label: "Valor", value: formatCurrency(installment.amount) },
                    ]}
                  />
                </DataCard>
              ))}
            </div>
            <div className="hidden md:block">
              <Table headings={["Vencimento", "Compra", "Amigo", "Cartão", "Parcela", "Valor", "Status", ""]}>
                {installments.data.data.map((installment) => (
                  <tr key={installment.id}>
                    <td className="px-3 py-3">{formatDate(installment.dueDate)}</td>
                    <td className="px-3 py-3 font-medium text-slate-950">{installment.purchase.description}</td>
                    <td className="px-3 py-3">{installment.purchase.friend.name}</td>
                    <td className="px-3 py-3">{installment.purchase.creditCard.name}</td>
                    <td className="px-3 py-3">{installment.number}</td>
                    <td className="px-3 py-3 font-semibold">{formatCurrency(installment.amount)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={installment.status} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        variant={installment.status === "PAID" ? "secondary" : "primary"}
                        className="min-h-9 px-2"
                        disabled={updatePayment.isPending}
                        onClick={() => handlePaymentToggle(installment.id, installment.status)}
                      >
                        {installment.status === "PAID" ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                        {updatePayment.isPending ? "Atualizando..." : installment.status === "PAID" ? "Desfazer" : "Pagar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
            <Pagination
              page={filters.page}
              totalPages={installments.data.meta.totalPages}
              disabled={isLoadingInstallments}
              onPage={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
