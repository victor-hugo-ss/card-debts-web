import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom";

import { AppLayout } from "./layouts/app-layout";
import { LoginPage } from "../features/auth/login-page";
import { AdminCardsPage } from "../features/admin/pages/admin-cards-page";
import { AdminDashboardPage } from "../features/admin/pages/admin-dashboard-page";
import { AdminFriendDebtsPage } from "../features/admin/pages/admin-friend-debts-page";
import { AdminFriendsPage } from "../features/admin/pages/admin-friends-page";
import { AdminInstallmentsPage } from "../features/admin/pages/admin-installments-page";
import { AdminPurchasesPage } from "../features/admin/pages/admin-purchases-page";
import { FriendDashboardPage } from "../features/friend/pages/friend-dashboard-page";
import { FriendInstallmentsPage } from "../features/friend/pages/friend-installments-page";
import { FriendPurchasesPage } from "../features/friend/pages/friend-purchases-page";
import { useMe } from "../hooks/use-auth";
import { getToken } from "../shared/lib/storage";
import type { Role } from "../shared/api/types";

function AuthGate({ roles }: { roles: Role[] }) {
  const location = useLocation();
  const { data: user, isLoading, isError } = useMe();

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Carregando...</div>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "ADMIN" ? "/admin/dashboard" : "/friend/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

function HomeRedirect() {
  const { data: user, isLoading } = useMe();

  if (!getToken()) return <Navigate to="/login" replace />;
  if (isLoading) return <div className="p-6 text-sm text-slate-500">Carregando...</div>;

  return (
    <Navigate
      to={user?.role === "ADMIN" ? "/admin/dashboard" : "/friend/dashboard"}
      replace
    />
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <HomeRedirect /> },
  {
    element: <AuthGate roles={["ADMIN"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboardPage /> },
          { path: "/admin/friends", element: <AdminFriendsPage /> },
          { path: "/admin/friends/:friendId/debts", element: <AdminFriendDebtsPage /> },
          { path: "/admin/cards", element: <AdminCardsPage /> },
          { path: "/admin/purchases", element: <AdminPurchasesPage /> },
          { path: "/admin/installments", element: <AdminInstallmentsPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGate roles={["FRIEND"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/friend/dashboard", element: <FriendDashboardPage /> },
          { path: "/friend/purchases", element: <FriendPurchasesPage /> },
          { path: "/friend/installments", element: <FriendInstallmentsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
