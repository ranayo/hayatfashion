// src/components/NewArrivalsSection.tsx
import { db } from "@/firebase";
import ProductGrid from "./NewArrivalsGrid";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query as fsQuery,
} from "firebase/firestore";

export type Product = {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image: string;
  category?: string;
  currency?: string;
  href?: string;
  // ניתנים לסריאליזציה ל-Client:
  createdAtMs?: number;
  updatedAtMs?: number;
};

export default async function NewArrivalsSection() {
  const items = await getNewestProducts(6);

  return (
    <section className="bg-[#f6f2ef]">
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-12">
        {/* כותרת אלגנטית */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#a79286]">
              Just in
            </p>
            <h2 className="mt-1 inline-block text-[28px] font-semibold text-[#4b3a2f]">
              New Arrivals
            </h2>
            <span className="ml-2 inline-block h-[6px] w-20 rounded-full bg-[#e7d6cd]" />
          </div>
        </div>

        <ProductGrid items={items} />
      </div>
    </section>
  );
}

async function getNewestProducts(n: number): Promise<Product[]> {
  // 1) נסיון לפי createdAt
  try {
    const q = fsQuery(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      limit(n)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map(docToProduct);
  } catch {}

  // 2) נפילה ל-updatedAt
  try {
    const q2 = fsQuery(
      collection(db, "products"),
      orderBy("updatedAt", "desc"),
      limit(n)
    );
    const snap2 = await getDocs(q2);
    if (!snap2.empty) return snap2.docs.map(docToProduct);
  } catch {}

  // 3) גיבוי: מביאים 50, ממיינים לפי תאריכים, ולוקחים 6
  const snap3 = await getDocs(fsQuery(collection(db, "products"), limit(50)));
  const list = snap3.docs.map(docToProduct);
  list.sort(
    (a, b) =>
      (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0) ||
      (b.updatedAtMs ?? 0) - (a.updatedAtMs ?? 0)
  );
  return list.slice(0, n);
}

function docToProduct(d: any): Product {
  const data = d.data() || {};
  const category = data.category ?? "misc";
  const href = `/category/${encodeURIComponent(category)}/${encodeURIComponent(
    d.id
  )}`;

  return {
    id: d.id,
    title: data.title ?? "Product",
    price: Number(data.price ?? 0),
    salePrice: data.salePrice ?? null,
    image:
      Array.isArray(data.images) && data.images.length
        ? data.images[0]
        : data.image ?? "/product-1.png",
    category,
    currency: data.currency ?? "EUR",
    href,
    // ממירים ל־millis כדי שלא יעיף את ה-RSC/Client
    createdAtMs: ts(data.createdAt),
    updatedAtMs: ts(data.updatedAt),
  };
}

function ts(v: any): number {
  if (!v) return 0;
  if (typeof v?.toDate === "function") return v.toDate().getTime(); // Firestore Timestamp
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") return new Date(v).getTime();
  if (typeof v === "number") return v;
  return 0;
}
