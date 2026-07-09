import { api } from "./api-client";
import type {
  CreditCard,
  DashboardByCreditCard,
  DashboardByFriend,
  DashboardByMonth,
  DashboardSummary,
  DashboardUpcomingInstallment,
  Friend,
  FriendDebts,
  FriendInstallment,
  FriendPurchase,
  FriendSummary,
  Installment,
  InstallmentStatus,
  Paginated,
  Purchase,
  User,
} from "./types";

export const queryKeys = {
  me: ["me"] as const,
  friends: ["friends"] as const,
  creditCards: ["creditCards"] as const,
  purchases: (filters?: unknown) => ["purchases", filters] as const,
  installments: (filters?: unknown) => ["installments", filters] as const,
  dashboard: ["dashboard"] as const,
  friendSummary: ["friendSummary"] as const,
  friendPurchases: ["friendPurchases"] as const,
  friendInstallments: (filters?: unknown) =>
    ["friendInstallments", filters] as const,
  friendDebts: (friendId: string) => ["friendDebts", friendId] as const,
};

export function login(input: { email: string; password: string }) {
  return api<{ token: string }>("/sessions", {
    method: "POST",
    body: input,
  });
}

export function getMe() {
  return api<User>("/me");
}

export function listFriends() {
  return api<Friend[]>("/users/friends");
}

export function createFriend(input: {
  name: string;
  email: string;
  password: string;
}) {
  return api<Friend>("/admin/friends", {
    method: "POST",
    body: input,
  });
}

export function listCreditCards() {
  return api<CreditCard[]>("/credit-cards");
}

export function createCreditCard(input: CreditCardInput) {
  return api<CreditCard>("/credit-cards", {
    method: "POST",
    body: input,
  });
}

export function updateCreditCard(id: string, input: Partial<CreditCardInput>) {
  return api<CreditCard>(`/credit-cards/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteCreditCard(id: string) {
  return api<void>(`/credit-cards/${id}`, {
    method: "DELETE",
  });
}

export type CreditCardInput = {
  name: string;
  brand?: string;
  lastDigits?: string;
  limit?: number;
  closingDay: number;
  dueDay: number;
};

export type ListFilters = {
  status?: InstallmentStatus | "";
  friendId?: string;
  creditCardId?: string;
  month?: string;
  page?: number;
  perPage?: number;
};

export function listPurchases(filters: ListFilters) {
  return api<Paginated<Purchase>>("/purchases", { params: filters });
}

export function createPurchase(input: {
  description: string;
  amount: number;
  purchaseDate: string;
  installmentsCount: number;
  friendId: string;
  creditCardId: string;
}) {
  return api<Purchase>("/purchases", {
    method: "POST",
    body: input,
  });
}

export function listInstallments(filters: ListFilters) {
  return api<Paginated<Installment>>("/installments", { params: filters });
}

export function payInstallment(id: string) {
  return api<Installment>(`/installments/${id}/pay`, { method: "PATCH" });
}

export function unpayInstallment(id: string) {
  return api<Installment>(`/installments/${id}/unpay`, { method: "PATCH" });
}

export function getDashboardSummary() {
  return api<DashboardSummary>("/dashboard/summary");
}

export function getDashboardByFriend() {
  return api<DashboardByFriend[]>("/dashboard/by-friend");
}

export function getDashboardByCreditCard() {
  return api<DashboardByCreditCard[]>("/dashboard/by-credit-card");
}

export function getDashboardUpcomingInstallments() {
  return api<DashboardUpcomingInstallment[]>(
    "/dashboard/upcoming-installments",
  );
}

export function getDashboardByMonth() {
  return api<DashboardByMonth[]>("/dashboard/by-month");
}

export function getFriendSummary() {
  return api<FriendSummary>("/friend/summary");
}

export function listFriendPurchases() {
  return api<FriendPurchase[]>("/friend/purchases");
}

export function listFriendInstallments(filters: {
  status?: InstallmentStatus | "";
  month?: string;
}) {
  return api<FriendInstallment[]>("/friend/installments", { params: filters });
}

export function getFriendDebts(friendId: string) {
  return api<FriendDebts>(`/friends/${friendId}/debts`);
}
