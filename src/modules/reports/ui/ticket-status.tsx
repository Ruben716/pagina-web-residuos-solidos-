import { formatDate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { REPORT_TYPES, STATUS_STEPS, TICKET_PATTERN } from "../domain/report";
import { reportsRepository } from "../server/repository";

/** Resultado de la consulta por código. Se renderiza en el servidor en cada petición. */
export async function TicketStatus({ code }: { code: string }) {
  const normalized = code.trim().toUpperCase();
  if (!TICKET_PATTERN.test(normalized)) {
    return (
      <Message title="Ese código no tiene el formato correcto">
        Los códigos se ven así: <span className="numeral text-xl">MPP-2610-K7QD</span>. Revisa que no falte ningún guion.
      </Message>
    );
  }

  const report = await reportsRepository.get(normalized);
  if (!report) {
    return (
      <Message title={`No encontramos el reporte ${normalized}`}>
        Puede que el código tenga un carácter distinto. Si el problema sigue, llama a la central y dicta el código.
      </Message>
    );
  }

  const current = STATUS_STEPS.findIndex((s) => s.id === report.status);
  const type = REPORT_TYPES.find((t) => t.id === report.type);

  return (
    <article
      className="grid gap-10 rounded-3xl bg-white p-6 shadow-panel ring-1 ring-bruma md:p-10 lg:grid-cols-12"
      aria-labelledby="ticket-title"
    >
      <header className="lg:col-span-5">
        <p className="eyebrow">Reporte</p>
        <h2 id="ticket-title" className="numeral mt-3 text-5xl text-puno">
          {report.id}
        </h2>
        <dl className="mt-8 divide-y divide-bruma overflow-hidden rounded-2xl border border-bruma text-sm">
          {[
            ["Tipo", type?.label ?? report.type],
            ["Lugar", `${report.address}, ${report.barrio}`],
            ["Recibido", formatDate(report.createdAt, { dateStyle: "long", timeStyle: "short" })],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[6rem_1fr] gap-4 px-4 py-3.5 odd:bg-cielo/60">
              <dt className="font-semibold text-pizarra">{k}</dt>
              <dd className="font-bold text-tinta">{v}</dd>
            </div>
          ))}
        </dl>
      </header>
      <ol className="lg:col-span-7">
        {STATUS_STEPS.map((s, i) => (
          <li key={s.id} className="relative flex gap-6 pb-10 last:pb-0">
            <span aria-hidden className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full border-2 text-sm font-bold",
                  i < current && "border-puno bg-puno text-white",
                  i === current && "border-puno bg-celeste-50 text-puno",
                  i > current && "border-niebla text-pizarra/60",
                )}
              >
                {i + 1}
              </span>
              {i < STATUS_STEPS.length - 1 && <span className={cn("mt-2 w-0.5 flex-1", i < current ? "bg-puno" : "bg-bruma")} />}
            </span>
            <span className={cn("pt-1", i > current && "opacity-55")}>
              <span className="block text-lg font-extrabold text-puno-800">
                {s.label}
                {i === current && <span className="sr-only"> (etapa actual)</span>}
              </span>
              <span className="mt-1 block text-pizarra">{s.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="max-w-2xl rounded-2xl bg-white p-6 ring-1 ring-bruma">
      <h2 className="text-2xl font-extrabold text-puno-800">{title}</h2>
      <p className="mt-3 text-lg text-pizarra">{children}</p>
    </div>
  );
}
