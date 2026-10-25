import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string[] | string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

/** Etiqueta + ayuda + error. El control se enlaza con aria-describedby desde quien lo usa (ids `${id}-hint` y `${id}-error`). */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-4 text-sm font-bold text-tinta">
        {label}
        {optional && <span className="font-medium text-pizarra">Opcional</span>}
      </label>
      {children}
      {hint && !message && (
        <p id={`${id}-hint`} className="text-sm text-pizarra">
          {hint}
        </p>
      )}
      {message && (
        <p id={`${id}-error`} className="flex items-start gap-2 text-sm font-semibold text-peligroso" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: unknown, hint?: unknown) =>
  [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
