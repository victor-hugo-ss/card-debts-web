export type Role = "ADMIN" | "FRIEND";
export type InstallmentStatus = "PENDING" | "PAID";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Friend = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type CreditCard = {
  id: string;
  name: string;
  brand: string | null;
  lastDigits: string | null;
  limit: string | number | null;
  closingDay: number;
  dueDay: number;
  ownerId: string;
  createdAt: string;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type Purchase = {
  id: string;
  description: string;
  amount: string | number;
  purchaseDate: string;
  installmentsCount: number;
  ownerId: string;
  friendId: string;
  creditCardId: string;
  createdAt: string;
  friend: Friend;
  creditCard: Pick<CreditCard, "id" | "name" | "brand" | "lastDigits">;
  installments: PurchaseInstallment[];
};

export type PurchaseInstallment = {
  id: string;
  number: number;
  amount: string | number;
  dueDate: string;
  status: InstallmentStatus;
  paidAt: string | null;
};

export type Installment = PurchaseInstallment & {
  purchase: {
    id: string;
    description: string;
    purchaseDate: string;
    friend: Friend;
    creditCard: Pick<CreditCard, "id" | "name" | "brand" | "lastDigits">;
  };
};

export type DashboardSummary = {
  totalPending: number;
  totalPaid: number;
  totalPurchases: number;
  pendingInstallments: number;
  paidInstallments: number;
};

export type DashboardByFriend = DashboardSummary & {
  friendId: string;
  friendName: string;
};

export type DashboardByCreditCard = DashboardSummary & {
  creditCardId: string;
  creditCardName: string;
  creditCardBrand: string | null;
  creditCardLastDigits: string | null;
};

export type DashboardUpcomingInstallment = {
  installmentId: string;
  amount: string | number;
  dueDate: string;
  friendId: string;
  friendName: string;
  purchaseId: string;
  purchaseDescription: string;
  creditCardId: string;
  creditCardName: string;
};

export type DashboardByMonth = DashboardSummary & {
  month: string;
};

export type FriendSummary = {
  totalDebt: string;
  pendingDebt: string;
  paidDebt: string;
  pendingInstallments: number;
  paidInstallments: number;
};

export type FriendPurchase = Omit<
  Purchase,
  "ownerId" | "friendId" | "creditCardId" | "friend"
>;

export type FriendInstallment = PurchaseInstallment & {
  purchase: {
    id: string;
    description: string;
    purchaseDate: string;
    creditCard: Pick<CreditCard, "id" | "name" | "brand" | "lastDigits">;
  };
};

export type FriendDebts = {
  friend: Friend;
  totalPending: string | number;
  installments: FriendInstallment[];
};
