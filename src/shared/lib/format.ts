const LOCALE = "es-PE";

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(LOCALE, options).format(value);

/** Fechas en hora de Lima. Una fecha sin hora ("2026-03-15") se toma como mediodía en Lima para no saltar de día. */
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions = { dateStyle: "long" }) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: "America/Lima", ...options }).format(
    new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00-05:00` : iso),
  );

export const pad = (n: number, size = 2) => String(n).padStart(size, "0");
