import { CreditCard, LayoutDashboard, LogOut, Receipt, Users, WalletCards } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";

import { useLogout, useMe } from "../../hooks/use-auth";
import { Button } from "../../shared/ui";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/friends", label: "Amigos", icon: Users },
  { to: "/admin/cards", label: "Cartões", icon: CreditCard },
  { to: "/admin/purchases", label: "Compras", icon: Receipt },
  { to: "/admin/installments", label: "Parcelas", icon: WalletCards },
];

const friendLinks = [
  { to: "/friend/dashboard", label: "Resumo", icon: LayoutDashboard },
  { to: "/friend/purchases", label: "Compras", icon: Receipt },
  { to: "/friend/installments", label: "Parcelas", icon: WalletCards },
];

export function AppLayout() {
  const { data: user } = useMe();
  const logout = useLogout();
  const links = user?.role === "ADMIN" ? adminLinks : friendLinks;
  const roleLabel = user?.role === "ADMIN" ? "Administrador" : "Amigo";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-950">Card Debts</h1>
            <p className="truncate text-xs font-medium text-slate-500">
              {user?.name ?? "Usuário"} · {roleLabel}
            </p>
          </div>
          <Button variant="secondary" onClick={logout} title="Sair">
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[232px_1fr] lg:py-6">
        <nav className="flex justify-center gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm shadow-slate-950/[0.03] lg:block lg:space-y-1 lg:self-start lg:overflow-visible">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                clsx(
                  "focus-ring flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "hover:bg-slate-50 hover:text-slate-950",
                )
              }
              to={to}
              key={to}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
