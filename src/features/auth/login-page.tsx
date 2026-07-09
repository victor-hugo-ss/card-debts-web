import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, LogIn, Receipt, ShieldCheck, WalletCards } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button, ErrorMessage, Field } from "../../shared/ui";
import { persistSession } from "../../hooks/use-auth";
import { ApiError } from "../../shared/api/api-client";
import { getMe, login } from "../../shared/api/endpoints";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (input: LoginForm) => {
      const { token } = await login(input);
      persistSession(token);
      return getMe();
    },
    onSuccess: (user) => {
      const fallback =
        user.role === "ADMIN" ? "/admin/dashboard" : "/friend/dashboard";
      navigate((location.state as { from?: string } | null)?.from ?? fallback, {
        replace: true,
      });
    },
  });

  const error =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Não foi possível entrar"
        : undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white px-4 py-0 before:absolute before:inset-x-0 before:top-0 before:h-[310px] before:bg-slate-100 before:content-[''] sm:bg-slate-100 sm:py-8 sm:before:hidden">
      <div className="relative mx-auto grid min-h-screen w-full max-w-5xl items-start gap-4 pt-6 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_420px] lg:items-center lg:pt-0">
        <section className="hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/[0.03] lg:block">
          <div className="inline-flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <CreditCard size={24} />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-slate-950">Card Debts</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Controle compras compartilhadas, parcelas e pagamentos em um painel financeiro simples para administrar.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-white text-blue-700 shadow-sm">
                  <Receipt size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Compras</p>
                  <p className="text-xs text-slate-500">Registro e consulta por cartão</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">Admin</span>
            </div>

            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-white text-amber-700 shadow-sm">
                  <WalletCards size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Parcelas</p>
                  <p className="text-xs text-slate-500">Pendentes, pagas e vencimentos</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">Amigos</span>
            </div>

            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Acesso seguro</p>
                  <p className="text-xs text-slate-500">Cada usuário vê sua própria área</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">Sessão</span>
            </div>
          </div>
        </section>

        <div className="w-full bg-transparent p-0 sm:rounded-lg sm:border sm:border-slate-200 sm:bg-white sm:p-6 sm:shadow-sm sm:shadow-slate-950/[0.03]">
          <div className="lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                  <CreditCard size={22} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">Card Debts</p>
                  <p className="text-xs text-slate-500">Painel financeiro</p>
                </div>
              </div>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                Seguro
              </span>
            </div>

            <div className="mt-8">
              <h1 className="text-3xl font-bold text-slate-950">Entrar</h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Acompanhe compras, parcelas e pagamentos em uma área simples e segura.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-md bg-white px-2 py-2 text-center shadow-sm ring-1 ring-slate-200">
                <Receipt className="mx-auto text-blue-700" size={16} />
                <p className="mt-1 text-[11px] font-semibold text-slate-600">Compras</p>
              </div>
              <div className="rounded-md bg-white px-2 py-2 text-center shadow-sm ring-1 ring-slate-200">
                <WalletCards className="mx-auto text-amber-700" size={16} />
                <p className="mt-1 text-[11px] font-semibold text-slate-600">Parcelas</p>
              </div>
              <div className="rounded-md bg-white px-2 py-2 text-center shadow-sm ring-1 ring-slate-200">
                <ShieldCheck className="mx-auto text-emerald-700" size={16} />
                <p className="mt-1 text-[11px] font-semibold text-slate-600">Acesso</p>
              </div>
            </div>
          </div>

          <div className="-mx-4 mt-8 rounded-t-[28px] bg-white px-4 pt-6 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] sm:mx-0 sm:mt-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:pt-0 sm:shadow-none">
            <div className="mb-5 hidden sm:block">
              <h1 className="text-2xl font-bold text-slate-950">Entrar</h1>
              <p className="mt-1 text-sm text-slate-500">
                Acesse sua área para acompanhar cartões, compras e parcelas.
              </p>
            </div>

        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <ErrorMessage message={error} />
          <Field
            label="E-mail"
            type="email"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <Field
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <Button type="submit" disabled={mutation.isPending}>
            <LogIn size={17} />
            {mutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Painel financeiro compartilhado
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
