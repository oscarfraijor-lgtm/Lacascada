"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";

// Filtro/búsqueda/orden del lado cliente sobre una lista YA renderizada por el
// server. Cada item trae su nodo server-rendered (con sus forms de server action
// intactos) + metadatos serializables para filtrar: `search` (haystack en
// minúsculas), `status`, `tags` (estados meta como "por revisar") y `sort`
// (valores por los que ordenar). El server hace la carga de datos; esto solo
// decide qué se muestra y en qué orden.
export interface FilterItem {
  key: string;
  search: string;
  status?: string;
  tags?: string[];
  sort?: Record<string, number | string>;
  node: ReactNode;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
  field: string;
  dir?: "asc" | "desc";
}

function compare(a: FilterItem, b: FilterItem, field: string, dir: "asc" | "desc"): number {
  const av = a.sort?.[field];
  const bv = b.sort?.[field];
  let r: number;
  if (typeof av === "number" && typeof bv === "number") r = av - bv;
  else r = String(av ?? "").localeCompare(String(bv ?? ""), "es-MX");
  return dir === "desc" ? -r : r;
}

export default function AdminFilterList({
  items,
  statuses = [],
  sorts = [],
  searchPlaceholder = "Buscar por nombre, correo o handle…",
  allStatusLabel = "Todos los estados",
  emptyLabel = "Nada coincide con tu búsqueda.",
}: {
  items: FilterItem[];
  statuses?: StatusOption[];
  sorts?: SortOption[];
  searchPlaceholder?: string;
  allStatusLabel?: string;
  emptyLabel?: string;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState(sorts[0]?.value ?? "");

  const needle = q.trim().toLowerCase();
  let filtered = items.filter(
    (i) =>
      (!status || i.status === status || i.tags?.includes(status)) &&
      (!needle || i.search.includes(needle))
  );

  const activeSort = sorts.find((s) => s.value === sort);
  if (activeSort) {
    filtered = [...filtered].sort((a, b) => compare(a, b, activeSort.field, activeSort.dir ?? "asc"));
  }

  const selectCls =
    "rounded-full border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Buscar"
            className="w-full rounded-full border border-ink/15 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-brand"
          />
        </div>
        {statuses.length > 0 && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por estado"
            className={selectCls}
          >
            <option value="">{allStatusLabel}</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
        {sorts.length > 0 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Ordenar"
            className={selectCls}
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="text-xs text-ink-soft">
        {filtered.length} de {items.length}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <div key={i.key}>{i.node}</div>
          ))}
        </div>
      )}
    </div>
  );
}
