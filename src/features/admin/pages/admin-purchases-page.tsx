import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  Table,
} from "../../../shared/ui";
import { ApiError } from "../../../shared/api/api-client";
import { formatCurrency, formatDate } from "../../../shared/lib/format";
import { invalidatePurchaseFlow } from "../../../shared/lib/query-invalidations";
import {
  createPurchase,
  listCreditCards,
  listFriends,
  listPurchases,
  queryKeys,
} from "../../../shared/api/endpoints";
import { queryClient } from "../../../shared/lib/query-client";

const defaultPurchaseDate = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  purchaseDate: z.string().min(1, "Informe a data"),
  installmentsCount: z.coerce.number().int().min(1).max(24),
  friendId: z.string().uuid("Informe um amigo"),
  creditCardId: z.string().uuid("Informe um cartão"),
});

type PurchaseForm = z.input<typeof schema>;

const defaultValues: PurchaseForm = {
  description: "",
  amount: "",
  purchaseDate: defaultPurchaseDate(),
  installmentsCount: 1,
  friendId: "",
  creditCardId: "",
};

function getQueryError(...errors: unknown[]) {
  const error = errors.find(Boolean);
  return error instanceof ApiError
    ? error.message
    : error
      ? "Não foi possível carregar os dados"
      : undefined;
}

export function AdminPurchasesPage() {
  const [filters, setFilters] = useState({ page: 1, perPage: 10, friendId: "", creditCardId: "", month: "" });
  const friends = useQuery({ queryKey: queryKeys.friends, queryFn: listFriends });
  const cards = useQuery({ queryKey: queryKeys.creditCards, queryFn: listCreditCards });
  const purchases = useQuery({
    queryKey: queryKeys.purchases(filters),
    queryFn: () => listPurchases(filters),
  });

  const form = useForm<PurchaseForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values: unknown) => createPurchase(schema.parse(values)),
    onSuccess: async () => {
      form.reset({ ...defaultValues, purchaseDate: defaultPurchaseDate() });
      await invalidatePurchaseFlow(queryClient);
    },
  });

  const error = mutation.error instanceof ApiError ? mutation.error.message : undefined;
  const optionsError = getQueryError(friends.error, cards.error);
  const listError = getQueryError(purchases.error);
  const isLoadingOptions = friends.isLoading || cards.isLoading;
  const isLoadingPurchases = purchases.isLoading || purchases.isFetching;

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Compras"
        description="Cadastre compras e acompanhe as parcelas geradas."
      />

      <Panel
        title="Cadastrar compra"
        description="Preencha os dados da compra para gerar as parcelas automaticamente."
      >
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <ErrorMessage className="md:col-span-2 xl:col-span-6" message={optionsError ?? error} />
          <Field label="Descrição" error={form.formState.errors.description?.message} {...form.register("description")} />
          <Field label="Valor" type="number" min="0.01" step="0.01" placeholder="0,00" error={form.formState.errors.amount?.message} {...form.register("amount")} />
          <Field label="Data" type="date" error={form.formState.errors.purchaseDate?.message} {...form.register("purchaseDate")} />
          <Field label="Parcelas" type="number" min={1} max={24} error={form.formState.errors.installmentsCount?.message} {...form.register("installmentsCount")} />
          <Select label="Amigo" disabled={friends.isLoading} error={form.formState.errors.friendId?.message} {...form.register("friendId")}>
            <option value="">Selecione</option>
            {friends.data?.map((friend) => <option key={friend.id} value={friend.id}>{friend.name}</option>)}
          </Select>
          <Select label="Cartão" disabled={cards.isLoading} error={form.formState.errors.creditCardId?.message} {...form.register("creditCardId")}>
            <option value="">Selecione</option>
            {cards.data?.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}
          </Select>
          <Button className="md:col-span-2 xl:col-span-1" type="submit" disabled={mutation.isPending || isLoadingOptions}>
            <Plus size={16} />
            {mutation.isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </form>
      </Panel>

      <Panel title="Compras cadastradas" description="Use os filtros para localizar compras por amigo, cartão ou mês.">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
          <Select label="Amigo" value={filters.friendId} disabled={friends.isLoading} onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, friendId: event.target.value }))}>
            <option value="">Todos</option>
            {friends.data?.map((friend) => <option key={friend.id} value={friend.id}>{friend.name}</option>)}
          </Select>
          <Select label="Cartão" value={filters.creditCardId} disabled={cards.isLoading} onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, creditCardId: event.target.value }))}>
            <option value="">Todos</option>
            {cards.data?.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}
          </Select>
          <Field label="Mês" type="month" value={filters.month} onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, month: event.target.value }))} />
          <Button className="self-end" variant="secondary" onClick={() => setFilters({ page: 1, perPage: 10, friendId: "", creditCardId: "", month: "" })}>
            <Search size={16} />
            Limpar
          </Button>
        </div>

        <ErrorMessage className="mb-4" message={listError} />

        {purchases.isLoading ? (
          <LoadingState>Carregando compras...</LoadingState>
        ) : !purchases.data?.data.length ? (
          <EmptyState>Nenhuma compra encontrada.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {purchases.data.data.map((purchase) => (
                <DataCard
                  key={purchase.id}
                  title={purchase.description}
                  meta={`${purchase.friend.name} · ${purchase.creditCard.name}`}
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
              <Table headings={["Compra", "Amigo", "Cartão", "Data", "Valor", "Parcelas"]}>
                {purchases.data.data.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-3 py-3 font-medium text-slate-950">{purchase.description}</td>
                    <td className="px-3 py-3">{purchase.friend.name}</td>
                    <td className="px-3 py-3">{purchase.creditCard.name}</td>
                    <td className="px-3 py-3">{formatDate(purchase.purchaseDate)}</td>
                    <td className="px-3 py-3 font-semibold">{formatCurrency(purchase.amount)}</td>
                    <td className="px-3 py-3">{purchase.installmentsCount}x</td>
                  </tr>
                ))}
              </Table>
            </div>
            <Pagination
              page={filters.page}
              totalPages={purchases.data.meta.totalPages}
              disabled={isLoadingPurchases}
              onPage={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
