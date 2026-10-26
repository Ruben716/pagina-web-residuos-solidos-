import type { ReactNode } from "react";

export function PanelHeader({ title, lede, children }: { title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-extrabold text-puno-800">{title}</h1>
        {lede && <p className="mt-2 max-w-[70ch] text-pizarra">{lede}</p>}
      </div>
      {children}
    </header>
  );
}

export function PanelSkeleton() {
  return (
    <div aria-busy className="space-y-4">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-bruma" />
      <div className="h-5 w-96 max-w-full animate-pulse rounded-lg bg-bruma" />
      <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
