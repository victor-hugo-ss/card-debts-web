export function formatCurrency(value: unknown) {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatMonth(value: string) {
  const [year, month] = value.split("-");
  if (!year || !month) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${year}-${month}-01T00:00:00.000Z`));
}

export function formatInstallmentProgress(paid: number, pending: number) {
  return `${paid}/${paid + pending}`;
}
