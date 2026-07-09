import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import {
  Button,
  DataCard,
  EmptyState,
  ErrorMessage,
  Field,
  LoadingState,
  PageHeader,
  Panel,
  Table,
} from "../../../shared/ui";
import { ApiError } from "../../../shared/api/api-client";
import { createFriend, listFriends, queryKeys } from "../../../shared/api/endpoints";
import { queryClient } from "../../../shared/lib/query-client";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type FriendForm = z.infer<typeof schema>;

export function AdminFriendsPage() {
  const friends = useQuery({ queryKey: queryKeys.friends, queryFn: listFriends });
  const form = useForm<FriendForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: createFriend,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: queryKeys.friends });
    },
  });

  const error = mutation.error instanceof ApiError ? mutation.error.message : undefined;
  const listError =
    friends.error instanceof ApiError
      ? friends.error.message
      : friends.error
        ? "Não foi possível carregar os amigos."
        : undefined;

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Amigos"
        description="Cadastre acessos e acompanhe dívidas por amigo."
      />

      <Panel title="Cadastrar amigo">
        <form className="grid gap-3 md:grid-cols-[1fr_1fr_220px_auto]" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <ErrorMessage className="md:col-span-4" message={error} />
          <Field label="Nome" error={form.formState.errors.name?.message} {...form.register("name")} />
          <Field label="E-mail" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
          <Field label="Senha" type="password" error={form.formState.errors.password?.message} {...form.register("password")} />
          <Button className="self-end" type="submit" disabled={mutation.isPending}>
            <UserPlus size={16} />
            Cadastrar
          </Button>
        </form>
      </Panel>

      <Panel title="Amigos cadastrados">
        <ErrorMessage className="mb-4" message={listError} />
        {friends.isLoading ? (
          <LoadingState>Carregando amigos...</LoadingState>
        ) : !friends.data?.length ? (
          <EmptyState>Nenhum amigo cadastrado.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {friends.data.map((friend) => (
                <DataCard
                  key={friend.id}
                  title={friend.name}
                  meta={`${friend.email} · ${new Date(friend.createdAt).toLocaleDateString("pt-BR")}`}
                  action={
                    <Link
                      className="focus-ring inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                      to={`/admin/friends/${friend.id}/debts`}
                    >
                      <Eye size={15} />
                      Dívidas
                    </Link>
                  }
                />
              ))}
            </div>
            <div className="hidden md:block">
              <Table headings={["Nome", "E-mail", "Criado em", ""]}>
                {friends.data.map((friend) => (
                  <tr key={friend.id}>
                    <td className="px-3 py-3 font-medium text-slate-950">{friend.name}</td>
                    <td className="px-3 py-3">{friend.email}</td>
                    <td className="px-3 py-3">{new Date(friend.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        className="focus-ring inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                        to={`/admin/friends/${friend.id}/debts`}
                        title="Ver dívidas"
                      >
                        <Eye size={15} />
                        Dívidas
                      </Link>
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
