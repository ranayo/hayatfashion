"use client";

import { useEffect, useState } from "react";
import { fetchProductsByCategory } from "@/lib/products";
import { Product, SizeOption } from "@/types";
import ProductCard from "@/components/ProductCard";
import ProductFilters, { FiltersState } from "@/components/ProductFilters";


export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category as Product["category"];
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (filters?: FiltersState) => {
    setLoading(true);
    const data = await fetchProductsByCategory(category);
    const filtered = data.filter((p) => {
      const okSize = filters?.size ? p.sizes?.some((s) => s.size === filters.size && s.stock > 0) : true;
      const okColor = filters?.color ? p.colors?.includes(filters.color) : true;
      return okSize && okColor;
    });
    setItems(filtered);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [category]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-28">
      <h1 className="text-3xl font-semibold tracking-tight capitalize">{category}</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div>
          <ProductFilters onChange={(f) => load(f)} />
        </div>
        <div className="md:col-span-3">
          {loading ? (
            <p className="text-neutral-500">טוען מוצרים…</p>
          ) : items.length === 0 ? (
            <p className="text-neutral-500">אין מוצרים שתואמים לסינון.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
