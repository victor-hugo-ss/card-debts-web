import clsx from "clsx";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Loader2 } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "focus-ring inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-blue-700 text-white shadow-sm shadow-blue-950/10 hover:bg-blue-800",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50",
        variant === "danger" &&
          "bg-red-600 text-white shadow-sm shadow-red-950/10 hover:bg-red-700",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        className,
      )}
      {...props}
    />
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-slate-700">
      <span className="truncate">{label}</span>
      <input
        className={clsx(
          "focus-ring h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm placeholder:text-slate-400",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-slate-700">
      <span className="truncate">{label}</span>
      <select
        className={clsx(
          "focus-ring h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm",
          error && "border-red-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={clsx(
          "mt-2 break-words text-2xl font-bold leading-tight",
          tone === "neutral" && "text-slate-950",
          tone === "good" && "text-emerald-700",
          tone === "warn" && "text-amber-700",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function DataCard({
  title,
  meta,
  badge,
  children,
  action,
}: {
  title: ReactNode;
  meta?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="break-words font-semibold text-slate-950">{title}</p>
          {meta ? <p className="mt-1 break-words text-sm text-slate-500">{meta}</p> : null}
        </div>
        {badge ? <div className="max-w-[132px] shrink-0 text-right">{badge}</div> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function KeyValueGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: ReactNode;
    tone?: "neutral" | "good" | "warn";
    align?: "left" | "right";
  }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {items.map((item, index) => (
        <div
          className={clsx(
            item.align === "right" || (!item.align && index % 2 === 1)
              ? "text-right"
              : "text-left",
          )}
          key={item.label}
        >
          <p className="text-xs font-medium text-slate-500">{item.label}</p>
          <p
            className={clsx(
              "break-words font-semibold",
              item.tone === "good" && "text-emerald-700",
              item.tone === "warn" && "text-amber-700",
              (!item.tone || item.tone === "neutral") && "text-slate-950",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function LoadingState({ children = "Carregando..." }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 p-6 text-sm font-medium text-slate-500">
      <Loader2 className="animate-spin" size={16} />
      {children}
    </div>
  );
}

export function ErrorMessage({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      className={clsx(
        "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: "PENDING" | "PAID";
}) {
  const paid = status === "PAID";
  const Icon = paid ? CheckCircle2 : Clock3;

  return (
    <span
      className={clsx(
        "inline-flex min-h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-bold shadow-sm",
        paid
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-950/[0.04]"
          : "border-amber-200 bg-amber-50 text-amber-700 shadow-amber-950/[0.04]",
      )}
    >
      <Icon size={13} strokeWidth={2.5} />
      {paid ? "Paga" : "Pendente"}
    </span>
  );
}

export function Pagination({
  page,
  totalPages,
  onPage,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  const safeTotal = Math.max(totalPages, 1);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600">
      <Button
        variant="secondary"
        disabled={disabled || page <= 1}
        onClick={() => onPage(page - 1)}
        title="Página anterior"
      >
        <ChevronLeft size={16} />
        Anterior
      </Button>
      <span className="rounded-md bg-slate-100 px-3 py-2 font-medium text-slate-700">
        Página {page} de {safeTotal}
      </span>
      <Button
        variant="secondary"
        disabled={disabled || page >= safeTotal}
        onClick={() => onPage(page + 1)}
        title="Próxima página"
      >
        Próxima
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

export function Table({
  headings,
  children,
}: {
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            {headings.map((heading) => (
              <th className="whitespace-nowrap px-3 py-3 font-semibold" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
}
