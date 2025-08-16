"use client";
import { useState } from "react";

export type FiltersState = {
  size?: string;
  color?: string;
};

export default function ProductFilters({ onChange }: { onChange: (f: FiltersState) => void }) {
  const [filters, setFilters] = useState<FiltersState>({});

  function update(partial: Partial<FiltersState>) {
    const next = { ...filters, ...partial };
    setFilters(next);
    onChange(next);
  }

  return (
    <div className="sticky top-24 rounded-2xl bg-white p-4 shadow-sm space-y-3">
      <div>
        <label className="text-sm font-medium">מידה</label>
        <select className="mt-1 w-full rounded-lg border p-2" onChange={(e) => update({ size: e.target.value || undefined })}>
          <option value="">הכל</option>
          {"XS,S,M,L,XL,One-Size".split(",").map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">צבע</label>
        <select className="mt-1 w-full rounded-lg border p-2" onChange={(e) => update({ color: e.target.value || undefined })}>
          <option value="">הכל</option>
          {"Black,White,Beige,Pink,Blue,Green,Grey,Brown".split(",").map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
