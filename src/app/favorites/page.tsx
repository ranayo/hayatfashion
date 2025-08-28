// src/app/favorites/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard, { Product } from "@/components/ProductCard";
import { auth, db } from "@/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function FavoritesPage() {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // מעקב אחרי סטטוס התחברות
  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUid(u?.uid ?? null));
  }, []);

  // מאזינים בזמן אמת למסמכים ב־users/{uid}/favorites
  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const q = query(
      collection(db, "users", uid, "favorites"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: Product[] = snap.docs.map((d) => {
        const x = d.data() as any;

        // תמונה בטוחה לתצוגה
        const img =
          typeof x.image === "string" && x.image ? x.image : "/product-1.png";

        // salePrice כמספר או undefined (כדי ש-ProductCard יציג SALE נכון)
        const sale =
          x?.salePrice == null || x?.salePrice === ""
            ? undefined
            : Number(x.salePrice);

        return {
          id: d.id, // אותו מזהה ששמרנו (productId)
          title: x.title ?? "Product",
          price: Number(x.price ?? 0),
          salePrice: sale,
          currency: x.currency ?? "ILS",
          category: (x.category ?? "basics") as string,
          image: img,
          images: [img],
          description: x.description ?? "",
          rating: Number(x.rating ?? 5),
          colors: Array.isArray(x.colors) ? x.colors : [],
          sizes: Array.isArray(x.sizes) ? x.sizes : [],
          isActive: true,
        };
      });

      setItems(list);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  // מצב לא-מחובר
  if (!uid) {
    return (
      <main className="bg-[#f6f2ef] min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="mb-6 flex items-center justify-between">
            <nav className="text-sm text-[#7e6d65]">
              <Link href="/" className="hover:text-[#4b3a2f]">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-[#4b3a2f] font-medium">My Favorites</span>
            </nav>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#4b3a2f] ring-1 ring-[#e5ddd7] hover:bg-[#c8a18d] hover:text-white transition"
            >
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-4">
            My Favorites
          </h1>
          <p className="text-[#6b5a50]">Please log in to see your favorites.</p>
          <Link
            href="/login"
            className="inline-block mt-6 rounded-full bg-[#c8a18d] px-6 py-3 text-white hover:bg-[#4b3a2f] transition"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f6f2ef] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Breadcrumbs + Back */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="text-sm text-[#7e6d65]">
            <Link href="/" className="hover:text-[#4b3a2f]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#4b3a2f] font-medium">My Favorites</span>
          </nav>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#4b3a2f] ring-1 ring-[#e5ddd7] hover:bg-[#c8a18d] hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-8 text-center">
          My Favorites
        </h1>

        {loading ? (
          <p className="text-[#6b5a50]">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center">
            <p className="text-[#6b5a50]">Your favorites list is empty.</p>
            <Link
              href="/"
              className="inline-block mt-6 rounded-full bg-[#c8a18d] px-6 py-3 text-white hover:bg-[#4b3a2f] transition"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {items.map((p) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
