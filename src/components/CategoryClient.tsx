// src/components/CategoryClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query as fsQuery,
  where,
} from "firebase/firestore";

type Product = {
  id: string;
  title: string;
  price: number;
  salePrice?: number;            // ← בלי null
  image: string;
  category?: string;
  rating?: number;
  currency?: string;
  createdAt?: string | number | Date | null;
  updatedAt?: string | number | Date | null;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean | number;
};

type Props = {
  category: string;
  pageSize?: number;
};

const PAGE_SIZE_DEFAULT = 12;

export default function CategoryClient({
  category,
  pageSize = PAGE_SIZE_DEFAULT,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<Product[]>([]);
  const [page, setPage] = useState(1);

  // ---- Filters ----
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [saleOnly, setSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "rating_desc">("newest");

  // ---- Fetch products of this category ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        try {
          const q = fsQuery(
            collection(db, "products"),
            where("category", "==", category),
            orderBy("createdAt", "desc"),
            limit(200)
          );
          const snap = await getDocs(q);
          if (!cancelled) {
            setAll(snap.docs.map((doc) => toProduct(doc.id, doc.data(), category)));
            setPage(1);
          }
          setLoading(false);
          return;
        } catch {
          // fallback בלי orderBy
        }

        const q2 = fsQuery(
          collection(db, "products"),
          where("category", "==", category),
          limit(200)
        );
        const snap2 = await getDocs(q2);
        if (!cancelled) {
          setAll(snap2.docs.map((doc) => toProduct(doc.id, doc.data(), category)));
          setPage(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  // ערכים ייחודיים (לכפתורי פילטר)
  const allSizes = useMemo(() => {
    const s = new Set<string>();
    for (const p of all) (p.sizes || []).forEach((x) => x && s.add(String(x)));
    return Array.from(s).sort();
  }, [all]);

  const allColors = useMemo(() => {
    const s = new Set<string>();
    for (const p of all) (p.colors || []).forEach((x) => x && s.add(String(x).toLowerCase()));
    return Array.from(s).sort();
  }, [all]);

  // סינון + מיון
  const filtered = useMemo(() => {
    const min = minPrice ? Number(minPrice) : -Infinity;
    const max = maxPrice ? Number(maxPrice) : Infinity;

    let list = all.filter((p) => {
      const basePrice = Number(p.salePrice ?? p.price ?? 0);
      const inRange = basePrice >= min && basePrice <= max;

      const saleOk = saleOnly ? p.salePrice !== undefined : true;
      const stockOk =
        inStockOnly ? (typeof p.inStock === "number" ? p.inStock > 0 : !!p.inStock) : true;

      const sizeOk =
        selectedSizes.size === 0
          ? true
          : (p.sizes || []).some((s) => selectedSizes.has(String(s)));

      const colorOk =
        selectedColors.size === 0
          ? true
          : (p.colors || []).some((c) => selectedColors.has(String(c).toLowerCase()));

      return inRange && saleOk && stockOk && sizeOk && colorOk;
    });

    if (sort === "price_asc") {
      list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sort === "price_desc") {
      list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else if (sort === "rating_desc") {
      list.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    } else {
      list.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt)); // newest
    }

    return list;
  }, [all, minPrice, maxPrice, saleOnly, inStockOnly, selectedSizes, selectedColors, sort]);

  // עימוד
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = filtered.slice(start, end);

  // reset עמוד כשפילטר/מיון משתנה
  useEffect(() => {
    setPage(1);
  }, [minPrice, maxPrice, saleOnly, inStockOnly, selectedSizes, selectedColors, sort]);

  return (
    <div>
      {/* FILTER BAR */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Price */}
        <div className="md:col-span-4 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min ₪"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-[#e5ddd7] bg-white px-3 py-2 text-sm text-[#4b3a2f] placeholder:text-[#9a7f71] focus:outline-none focus:ring-2 focus:ring-[#c8a18d]"
          />
          <span className="text-[#9a7f71]">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max ₪"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-[#e5ddd7] bg-white px-3 py-2 text-sm text-[#4b3a2f] placeholder:text-[#9a7f71] focus:outline-none focus:ring-2 focus:ring-[#c8a18d]"
          />
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
            }}
            className="rounded-lg border border-[#e5ddd7] px-3 py-2 text-sm text-[#4b3a2f] hover:bg-[#f1e8e2]"
          >
            Clear
          </button>
        </div>

        {/* Sizes */}
        <div className="md:col-span-4">
          <div className="flex flex-wrap gap-2">
            {allSizes.length === 0 ? (
              <span className="text-sm text-[#9a7f71]">No sizes</span>
            ) : (
              allSizes.map((s) => {
                const active = selectedSizes.has(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSet(selectedSizes, setSelectedSizes, s)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      active
                        ? "bg-[#c8a18d] text-white border-[#c8a18d]"
                        : "border-[#e5ddd7] text-[#4b3a2f] hover:bg-[#f1e8e2]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="md:col-span-4">
          <div className="flex flex-wrap gap-2">
            {allColors.length === 0 ? (
              <span className="text-sm text-[#9a7f71]">No colors</span>
            ) : (
              allColors.map((c) => {
                const active = selectedColors.has(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleSet(selectedColors, setSelectedColors, c)}
                    className={`rounded-full border px-3 py-1 text-sm capitalize ${
                      active
                        ? "bg-[#c8a18d] text-white border-[#c8a18d]"
                        : "border-[#e5ddd7] text-[#4b3a2f] hover:bg-[#f1e8e2]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* switches + sort */}
        <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5ddd7] bg-white px-4 py-3">
          <div className="flex items-center gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#4b3a2f]">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={saleOnly}
                onChange={(e) => setSaleOnly(e.target.checked)}
              />
              On sale
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#4b3a2f]">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In stock
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sortSelect" className="text-sm text-[#9a7f71]">
              Sort
            </label>
            <select
              id="sortSelect"
              aria-label="Sort products"   // ← נגישות
              title="Sort products"        // ← עוזר לכלי הבדיקה
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-lg border border-[#e5ddd7] bg-white px-3 py-2 text-sm text-[#4b3a2f] focus:outline-none focus:ring-2 focus:ring-[#c8a18d]"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="h-[320px] animate-pulse rounded-xl bg-[#eee5df]" />
          ))}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[#6b5a50]">
            Showing <span className="font-medium">{total === 0 ? 0 : start + 1}</span> to{" "}
            <span className="font-medium">{end}</span> of{" "}
            <span className="font-medium">{total}</span> results
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pageItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              className={`rounded-md border px-3 py-2 text-sm ${
                pageSafe === 1
                  ? "cursor-not-allowed border-[#e5ddd7] text-gray-400"
                  : "border-[#e5ddd7] text-[#4b3a2f] hover:bg-[#f1e8e2]"
              }`}
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
              const n = i + 1;
              const active = n === pageSafe;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    active ? "bg-[#c8a18d] text-white" : "text-[#4b3a2f] hover:bg-[#f1e8e2]"
                  }`}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              className={`rounded-md border px-3 py-2 text-sm ${
                pageSafe === totalPages
                  ? "cursor-not-allowed border-[#e5ddd7] text-gray-400"
                  : "border-[#e5ddd7] text-[#4b3a2f] hover:bg-[#f1e8e2]"
              }`}
            >
              Next ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------- helpers ----------------- */

function toProduct(id: string, data: any, fallbackCategory?: string): Product {
  const createdAt =
    data?.createdAt?.toDate?.() ??
    (typeof data?.createdAt === "string"
      ? new Date(data.createdAt)
      : data?.createdAt ?? null);

  const colorsArr: string[] | undefined = Array.isArray(data?.colors)
    ? data.colors.map(String)
    : typeof data?.colors === "string"
    ? [String(data.colors)]
    : undefined;

  const sizesArr: string[] | undefined = Array.isArray(data?.sizes)
    ? data.sizes.map(String)
    : typeof data?.sizes === "string"
    ? [String(data.sizes)]
    : undefined;

  return {
    id,
    title: data?.title ?? "Product",
    price: Number(data?.price ?? 0),
    // ← נירמול: undefined אם אין מבצע (לא null)
    salePrice:
      data?.salePrice == null || data?.salePrice === ""
        ? undefined
        : Number(data.salePrice),
    image:
      Array.isArray(data?.images) && data?.images.length > 0
        ? data.images[0]
        : data?.image ?? "/product-1.png",
    category: data?.category ?? fallbackCategory,
    rating: Number(data?.rating ?? 0),
    currency: data?.currency ?? "ILS",
    createdAt,
    updatedAt: data?.updatedAt?.toDate?.() ?? data?.updatedAt ?? null,
    sizes: sizesArr,
    colors: colorsArr,
    inStock:
      typeof data?.inStock !== "undefined"
        ? data.inStock
        : typeof data?.stock === "number"
        ? data.stock
        : undefined,
  };
}

function toTime(v?: string | number | Date | null) {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  return new Date(v).getTime();
}

function toggleSet<T>(set: Set<T>, setState: (next: Set<T>) => void, value: T) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  setState(next);
}
