// src/components/ProductFilters.tsx
"use client";

import { useEffect, useState } from "react";

export type FiltersState = {
  size?: string;
  color?: string;
};

type Props = {
  onChange: (f: FiltersState) => void;
  // רשימות זמינות מהשרת/דף קטגוריה (אופציונלי)
  availableSizes?: string[];
  availableColors?: string[];
  // סט התחלתי (אופציונלי)
  initial?: FiltersState;
};

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "One-Size"];
const DEFAULT_COLORS = ["Black", "White", "Beige", "Pink", "Blue", "Green", "Grey", "Brown"];

export default function ProductFilters({
  onChange,
  availableSizes = DEFAULT_SIZES,
  availableColors = DEFAULT_COLORS,
  initial,
}: Props) {
  const [filters, setFilters] = useState<FiltersState>(initial ?? {});

  useEffect(() => {
    // על טעינה ראשונית – נעדכן את ההורה כדי שיסונכרן עם ה־initial (אם קיים)
    onChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(partial: Partial<FiltersState>) {
    const next = { ...filters, ...partial };
    // הפוך ערך ריק ל־undefined כדי שלא ילך לפיירסטור
    if (next.size === "") next.size = undefined;
    if (next.color === "") next.color = undefined;

    setFilters(next);
    onChange(next);
  }

  function reset() {
    const empty: FiltersState = {};
    setFilters(empty);
    onChange(empty);
  }

  return (
    <aside className="sticky top-24 rounded-2xl bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1e1b18]">סינון</h3>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[#c8a18d] hover:text-[#4b3a2f]"
          aria-label="איפוס סינון"
        >
          איפוס
        </button>
      </div>

      {/* מידה */}
      <div>
        <label htmlFor="filter-size" className="text-sm font-medium">
          מידה
        </label>
        <select
          id="filter-size"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={filters.size ?? ""}
          onChange={(e) => update({ size: e.target.value || undefined })}
        >
          <option value="">הכל</option>
          {availableSizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* צבע */}
      <div>
        <label htmlFor="filter-color" className="text-sm font-medium">
          צבע
        </label>
        <select
          id="filter-color"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={filters.color ?? ""}
          onChange={(e) => update({ color: e.target.value || undefined })}
        >
          <option value="">הכל</option>
          {availableColors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
