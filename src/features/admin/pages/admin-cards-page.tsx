import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  Panel,
  Table,
} from "../../../shared/ui";
import { ApiError } from "../../../shared/api/api-client";
import { formatCurrency } from "../../../shared/lib/format";
import {
  createCreditCard,
  deleteCreditCard,
  listCreditCards,
  queryKeys,
  updateCreditCard,
} from "../../../shared/api/endpoints";
import { queryClient } from "../../../shared/lib/query-client";
import type { CreditCard } from "../../../shared/api/types";

const schema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  brand: z.string().optional(),
  lastDigits: z.string().regex(/^\d{4}$/, "Informe 4 dígitos").optional().or(z.literal("")),
  limit: z.coerce.number().positive("O limite deve ser maior que zero").optional().or(z.literal("")),
  closingDay: z.coerce.number().int().min(1).max(31),
  dueDay: z.coerce.number().int().min(1).max(31),
});

type CardForm = z.output<typeof schema>;

const defaults: CardForm = {
  name: "",
  brand: "",
  lastDigits: "",
  limit: "",
  closingDay: 1,
  dueDay: 10,
};

function toPayload(values: CardForm) {
  return {
    name: values.name,
    brand: values.brand || undefined,
    lastDigits: values.lastDigits || undefined,
    limit: values.limit === "" ? undefined : Number(values.limit),
    closingDay: Number(values.closingDay),
    dueDay: Number(values.dueDay),
  };
}

export function AdminCardsPage() {
  const [editing, setEditing] = useState<CreditCard | null>(null);
  const cards = useQuery({ queryKey: queryKeys.creditCards, queryFn: listCreditCards });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!editing) {
      form.reset(defaults);
      return;
    }

    form.reset({
      name: editing.name,
      brand: editing.brand ?? "",
      lastDigits: editing.lastDigits ?? "",
      limit: editing.limit === null ? "" : Number(editing.limit),
      closingDay: editing.closingDay,
      dueDay: editing.dueDay,
    });
  }, [editing, form]);

  const save = useMutation({
    mutationFn: (values: unknown) => {
      const parsed = schema.parse(values);
      return editing
        ? updateCreditCard(editing.id, toPayload(parsed))
        : createCreditCard(toPayload(parsed));
    },
    onSuccess: () => {
      setEditing(null);
      form.reset(defaults);
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
    },
  });

  const remove = useMutation({
    mutationFn: deleteCreditCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.creditCards }),
  });

  const error = save.error instanceof ApiError ? save.error.message : undefined;
  const listError =
    cards.error instanceof ApiError
      ? cards.error.message
      : cards.error
        ? "Não foi possível carregar os cartões."
        : undefined;

  function handleRemove(card: CreditCard) {
    if (window.confirm(`Deseja excluir o cartão ${card.name}?`)) {
      remove.mutate(card.id);
    }
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Cartões"
        description="Gerencie os cartões usados para compras dos amigos."
      />

      <Panel
        title={editing ? "Editar cartão" : "Cadastrar cartão"}
        action={editing ? <Button variant="ghost" onClick={() => setEditing(null)}><X size={16} />Cancelar</Button> : null}
      >
        <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-6" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
          <ErrorMessage className="md:col-span-3 xl:col-span-6" message={error} />
          <Field label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
          <Field label="Bandeira" error={form.formState.errors.brand?.message} {...form.register("brand")} />
          <Field label="Últimos 4 dígitos" maxLength={4} error={form.formState.errors.lastDigits?.message} {...form.register("lastDigits")} />
          <Field label="Limite" type="number" step="0.01" error={form.formState.errors.limit?.message} {...form.register("limit")} />
          <Field label="Fechamento" type="number" min={1} max={31} error={form.formState.errors.closingDay?.message} {...form.register("closingDay")} />
          <Field label="Vencimento" type="number" min={1} max={31} error={form.formState.errors.dueDay?.message} {...form.register("dueDay")} />
          <Button className="md:col-span-3 xl:col-span-1" type="submit" disabled={save.isPending}>
            <Plus size={16} />
            {editing ? "Salvar" : "Cadastrar"}
          </Button>
        </form>
      </Panel>

      <Panel title="Cartões cadastrados">
        <ErrorMessage className="mb-4" message={listError} />
        {cards.isLoading ? (
          <LoadingState>Carregando cartões...</LoadingState>
        ) : !cards.data?.length ? (
          <EmptyState>Nenhum cartão cadastrado.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {cards.data.map((card) => (
                <DataCard
                  key={card.id}
                  title={card.name}
                  meta={`${card.brand ?? "Sem bandeira"}${card.lastDigits ? ` · final ${card.lastDigits}` : ""}`}
                  action={
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" className="min-h-10" onClick={() => setEditing(card)}>
                        <Pencil size={15} />
                        Editar
                      </Button>
                      <Button variant="danger" className="min-h-10" disabled={remove.isPending} onClick={() => handleRemove(card)}>
                        <Trash2 size={15} />
                        Excluir
                      </Button>
                    </div>
                  }
                >
                  <KeyValueGrid
                    items={[
                      { label: "Limite", value: card.limit ? formatCurrency(card.limit) : "-" },
                      { label: "Fechamento", value: `Dia ${card.closingDay}` },
                      { label: "Vencimento", value: `Dia ${card.dueDay}` },
                    ]}
                  />
                </DataCard>
              ))}
            </div>
            <div className="hidden md:block">
              <Table headings={["Nome", "Bandeira", "Final", "Limite", "Fechamento", "Vencimento", ""]}>
                {cards.data.map((card) => (
                  <tr key={card.id}>
                    <td className="px-3 py-3 font-medium text-slate-950">{card.name}</td>
                    <td className="px-3 py-3">{card.brand ?? "-"}</td>
                    <td className="px-3 py-3">{card.lastDigits ?? "-"}</td>
                    <td className="px-3 py-3">{card.limit ? formatCurrency(card.limit) : "-"}</td>
                    <td className="px-3 py-3">Dia {card.closingDay}</td>
                    <td className="px-3 py-3">Dia {card.dueDay}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="min-h-9 px-2" title="Editar" onClick={() => setEditing(card)}>
                          <Pencil size={15} />
                        </Button>
                        <Button variant="danger" className="min-h-9 px-2" title="Excluir" disabled={remove.isPending} onClick={() => handleRemove(card)}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
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
