import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
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
  Panel,
  Select,
  StatusBadge,
  Table,
} from "../../../shared/ui";
import { ApiError } from "../../../shared/api/api-client";
import { formatCurrency, formatDate } from "../../../shared/lib/format";
import { listFriendInstallments, queryKeys } from "../../../shared/api/endpoints";
import type { InstallmentStatus } from "../../../shared/api/types";

export function FriendInstallmentsPage() {
  const [filters, setFilters] = useState<{ status: InstallmentStatus | ""; month: string }>({
    status: "",
    month: "",
  });
  const installments = useQuery({
    queryKey: queryKeys.friendInstallments(filters),
    queryFn: () => listFriendInstallments(filters),
  });
  const error =
    installments.error instanceof ApiError
      ? installments.error.message
      : installments.error
        ? "Não foi possível carregar suas parcelas."
        : undefined;

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Minhas parcelas"
        description="Filtre suas parcelas por status e mês."
      />

      <Panel title="Parcelas">
        <div className="mb-4 grid gap-3 md:grid-cols-[180px_180px_auto]">
          <Select label="Status" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as InstallmentStatus | "" }))}>
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Paga</option>
          </Select>
          <Field label="Mês" type="month" value={filters.month} onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))} />
          <Button className="self-end" variant="secondary" onClick={() => setFilters({ status: "", month: "" })}>
            <Search size={16} />
            Limpar
          </Button>
        </div>

        <ErrorMessage className="mb-4" message={error} />

        {installments.isLoading ? (
          <LoadingState>Carregando parcelas...</LoadingState>
        ) : !installments.data?.length ? (
          <EmptyState>Nenhuma parcela encontrada.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {installments.data.map((installment) => (
                <DataCard
                  key={installment.id}
                  title={installment.purchase.description}
                  meta={installment.purchase.creditCard.name}
                  badge={
                    <div className="grid min-w-[112px] justify-items-end gap-1 text-right">
                      <p className="font-bold text-slate-950">
                        {formatCurrency(installment.amount)}
                      </p>
                      <StatusBadge status={installment.status} />
                    </div>
                  }
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
              <Table headings={["Vencimento", "Compra", "Cartão", "Parcela", "Valor", "Status"]}>
                {installments.data.map((installment) => (
                  <tr key={installment.id}>
                    <td className="px-3 py-3">{formatDate(installment.dueDate)}</td>
                    <td className="px-3 py-3 font-medium text-slate-950">{installment.purchase.description}</td>
                    <td className="px-3 py-3">{installment.purchase.creditCard.name}</td>
                    <td className="px-3 py-3">{installment.number}</td>
                    <td className="px-3 py-3 font-semibold">{formatCurrency(installment.amount)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={installment.status} />
                    </td>
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
