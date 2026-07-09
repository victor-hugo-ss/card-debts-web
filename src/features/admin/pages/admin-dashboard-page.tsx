import { useQueries } from "@tanstack/react-query";

import {
  EmptyState,
  ErrorMessage,
  DataCard,
  LoadingState,
  PageHeader,
  Panel,
  StatCard,
  Table,
} from "../../../shared/ui";
import {
  formatCurrency,
  formatDate,
  formatInstallmentProgress,
  formatMonth,
} from "../../../shared/lib/format";
import {
  getDashboardByCreditCard,
  getDashboardByFriend,
  getDashboardByMonth,
  getDashboardSummary,
  getDashboardUpcomingInstallments,
  queryKeys,
} from "../../../shared/api/endpoints";

function toNumber(value: unknown) {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));

  return Number.isFinite(parsed) ? parsed : 0;
}

function getErrorMessage(...errors: unknown[]) {
  return errors.some(Boolean) ? "Não foi possível carregar o dashboard." : undefined;
}

function getTotalAmount(item: { totalPending: unknown; totalPaid: unknown }) {
  return toNumber(item.totalPending) + toNumber(item.totalPaid);
}

function DashboardMobileCard({
  title,
  meta,
  primaryLabel,
  primaryValue,
  primaryTone = "neutral",
  pendingValue,
  paidValue,
  footer,
}: {
  title: string;
  meta?: string;
  primaryLabel: string;
  primaryValue: string;
  primaryTone?: "neutral" | "warn";
  pendingValue?: string;
  paidValue: string;
  footer?: string;
}) {
  const primaryValueColor =
    primaryTone === "warn" ? "text-amber-700" : "text-slate-950";

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="break-words font-semibold text-slate-950">{title}</p>
          {meta ? <p className="mt-1 break-words text-sm text-slate-500">{meta}</p> : null}
        </div>
        <div className="min-w-[112px] text-right">
          <p className="text-[11px] font-semibold uppercase text-slate-500">{primaryLabel}</p>
          <p className={`mt-1 break-words text-base font-bold ${primaryValueColor}`}>
            {primaryValue}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          {pendingValue ? (
            <>
              <p className="text-xs font-medium text-slate-500">Pendente</p>
              <p className="break-words text-sm font-semibold text-amber-700">
                {pendingValue}
              </p>
            </>
          ) : footer ? (
            <>
              <p className="text-xs font-medium text-slate-500">Parcelas</p>
              <p className="mt-1 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-bold text-blue-700 shadow-sm ring-1 ring-blue-100">
                {footer}
              </p>
            </>
          ) : null}
        </div>
        <div className="min-w-[112px] text-right">
          <p className="mt-2 text-[11px] font-semibold uppercase text-emerald-700">Pago</p>
          <p className="break-words text-sm font-bold text-emerald-700">{paidValue}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const [summary, byFriend, byCard, upcoming, byMonth] = useQueries({
    queries: [
      {
        queryKey: [...queryKeys.dashboard, "summary"],
        queryFn: getDashboardSummary,
      },
      {
        queryKey: [...queryKeys.dashboard, "by-friend"],
        queryFn: getDashboardByFriend,
      },
      {
        queryKey: [...queryKeys.dashboard, "by-card"],
        queryFn: getDashboardByCreditCard,
      },
      {
        queryKey: [...queryKeys.dashboard, "upcoming"],
        queryFn: getDashboardUpcomingInstallments,
      },
      {
        queryKey: [...queryKeys.dashboard, "by-month"],
        queryFn: getDashboardByMonth,
      },
    ],
  });

  const isLoading =
    summary.isLoading ||
    byFriend.isLoading ||
    byCard.isLoading ||
    upcoming.isLoading ||
    byMonth.isLoading;
  const error = getErrorMessage(
    summary.error,
    byFriend.error,
    byCard.error,
    upcoming.error,
    byMonth.error,
  );
  const totalPurchased = getTotalAmount({
    totalPending: summary.data?.totalPending,
    totalPaid: summary.data?.totalPaid,
  });

  if (isLoading) return <LoadingState>Carregando dashboard...</LoadingState>;

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Dashboard"
        description="Resumo geral das dívidas dos amigos."
      />

      <ErrorMessage message={error} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Pendente" value={formatCurrency(summary.data?.totalPending)} tone="warn" />
        <StatCard label="Pago" value={formatCurrency(summary.data?.totalPaid)} tone="good" />
        <StatCard label="Total comprado" value={formatCurrency(totalPurchased)} />
        <StatCard label="Parcelas pendentes" value={summary.data?.pendingInstallments ?? 0} />
        <StatCard label="Parcelas pagas" value={summary.data?.paidInstallments ?? 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Por amigo" description="Parcelas exibidas como pagas/total.">
          {!byFriend.data?.length ? (
            <EmptyState>Nenhum amigo com movimentação.</EmptyState>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {byFriend.data.map((item) => (
                  <DashboardMobileCard
                    key={item.friendId}
                    title={item.friendName}
                    primaryLabel="Pendente"
                    primaryValue={formatCurrency(item.totalPending)}
                    primaryTone="warn"
                    paidValue={formatCurrency(item.totalPaid)}
                    footer={formatInstallmentProgress(item.paidInstallments, item.pendingInstallments)}
                  />
                ))}
              </div>
              <div className="hidden md:block">
                <Table headings={["Amigo", "Pendente", "Pago", "Parcelas"]}>
                  {byFriend.data.map((item) => (
                    <tr key={item.friendId}>
                      <td className="px-3 py-3 font-medium text-slate-950">{item.friendName}</td>
                      <td className="px-3 py-3">{formatCurrency(item.totalPending)}</td>
                      <td className="px-3 py-3">{formatCurrency(item.totalPaid)}</td>
                      <td className="px-3 py-3 font-semibold">
                        {formatInstallmentProgress(item.paidInstallments, item.pendingInstallments)}
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Por cartão" description="Total comprado exibido em valor financeiro.">
          {!byCard.data?.length ? (
            <EmptyState>Nenhum cartão com movimentação.</EmptyState>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {byCard.data.map((item) => (
                  <DashboardMobileCard
                    key={item.creditCardId}
                    title={`${item.creditCardName}${item.creditCardLastDigits ? ` • ${item.creditCardLastDigits}` : ""}`}
                    primaryLabel="Total comprado"
                    primaryValue={formatCurrency(getTotalAmount(item))}
                    pendingValue={formatCurrency(item.totalPending)}
                    paidValue={formatCurrency(item.totalPaid)}
                  />
                ))}
              </div>
              <div className="hidden md:block">
                <Table headings={["Cartão", "Pendente", "Pago", "Total comprado"]}>
                  {byCard.data.map((item) => (
                    <tr key={item.creditCardId}>
                      <td className="px-3 py-3 font-medium text-slate-950">
                        {item.creditCardName}
                        {item.creditCardLastDigits ? ` • ${item.creditCardLastDigits}` : ""}
                      </td>
                      <td className="px-3 py-3">{formatCurrency(item.totalPending)}</td>
                      <td className="px-3 py-3">{formatCurrency(item.totalPaid)}</td>
                      <td className="px-3 py-3 font-semibold">{formatCurrency(getTotalAmount(item))}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Próximos vencimentos" description="Parcelas abertas ordenadas por vencimento.">
          {!upcoming.data?.length ? (
            <EmptyState>Sem vencimentos próximos.</EmptyState>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {upcoming.data.map((item) => (
                  <DataCard
                    key={item.installmentId}
                    title={item.purchaseDescription}
                    meta={`${item.friendName} · ${formatDate(item.dueDate)}`}
                    badge={<p className="font-bold text-slate-950">{formatCurrency(item.amount)}</p>}
                  />
                ))}
              </div>
              <div className="hidden md:block">
                <Table headings={["Vencimento", "Amigo", "Compra", "Valor"]}>
                  {upcoming.data.map((item) => (
                    <tr key={item.installmentId}>
                      <td className="px-3 py-3">{formatDate(item.dueDate)}</td>
                      <td className="px-3 py-3">{item.friendName}</td>
                      <td className="px-3 py-3 font-medium text-slate-950">{item.purchaseDescription}</td>
                      <td className="px-3 py-3 font-semibold">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Por mês" description="Total comprado exibido em valor financeiro.">
          {!byMonth.data?.length ? (
            <EmptyState>Nenhum mês consolidado.</EmptyState>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {byMonth.data.map((item) => (
                  <DashboardMobileCard
                    key={item.month}
                    title={formatMonth(item.month)}
                    primaryLabel="Total comprado"
                    primaryValue={formatCurrency(getTotalAmount(item))}
                    pendingValue={formatCurrency(item.totalPending)}
                    paidValue={formatCurrency(item.totalPaid)}
                  />
                ))}
              </div>
              <div className="hidden md:block">
                <Table headings={["Mês", "Pendente", "Pago", "Total comprado"]}>
                  {byMonth.data.map((item) => (
                    <tr key={item.month}>
                      <td className="px-3 py-3 font-medium text-slate-950">{formatMonth(item.month)}</td>
                      <td className="px-3 py-3">{formatCurrency(item.totalPending)}</td>
                      <td className="px-3 py-3">{formatCurrency(item.totalPaid)}</td>
                      <td className="px-3 py-3 font-semibold">{formatCurrency(getTotalAmount(item))}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
