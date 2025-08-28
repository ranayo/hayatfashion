"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// אם אצלך ה־db מיוצא מ- "@/firebase/config" — עדכני את הנתיב בהתאם:
import { db } from "@/firebase";

import {
  collection,
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  query as fsQuery,
  startAt,
  endAt,
} from "firebase/firestore";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  href?: string;
  category?: string;
  salePrice?: number | null;
  titleLowercase?: string;
  categoryLowercase?: string;
};

const RECENT_KEY = "hayat_recent_searches";

const quickLinks = [
  { label: "All Dresses", href: "/category/dresses" },
  { label: "All Pants", href: "/category/pants" },
  { label: "All Shirts", href: "/category/shirts" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "About", href: "/about" },
];

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Search() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // חיפושים אחרונים
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  // קיצורי מקלדת: '/' לפתיחה, ESC לסגירה
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // פוקוס אינפוט בעת פתיחה
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // חיפוש מוצרים
  useEffect(() => {
    const run = async () => {
      const term = dq.trim();
      if (!term) {
        setResults([]);
        return;
      }
      setLoading(true);
      const termLower = term.toLowerCase();

      const toProduct = (d: any): Product => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title ?? "",
          price: Number(data.price ?? 0),
          salePrice: data.salePrice ?? null,
          image: (data.images?.[0] as string) || data.image || "/product-1.png",
          href: data.slug ? `/product/${data.slug}` : `/product/${d.id}`,
          category: data.category ?? "",
          titleLowercase: (data.titleLowercase ?? data.title ?? "").toLowerCase(),
          categoryLowercase: (data.categoryLowercase ?? data.category ?? "").toLowerCase(),
        };
      };

      try {
        // 1) חיפוש מהיר לפי titleLowercase
        const byTitle = fsQuery(
          collection(db, "products"),
          orderBy("titleLowercase"),
          startAt(termLower),
          endAt(termLower + "\uf8ff"),
          limit(24)
        );
        const s1 = await getDocs(byTitle);
        if (!s1.empty) {
          setResults(s1.docs.map(toProduct));
          return;
        }
      } catch {}

      try {
        // 2) חיפוש לפי קטגוריה (למשל: pants / מכנסיים)
        const byCat = fsQuery(
          collection(db, "products"),
          orderBy("categoryLowercase"),
          startAt(termLower),
          endAt(termLower + "\uf8ff"),
          limit(24)
        );
        const s2 = await getDocs(byCat);
        if (!s2.empty) {
          setResults(s2.docs.map(toProduct));
          return;
        }
      } catch {}

      try {
        // 3) Fallback — כל תתי־האוספים בשם 'products' + סינון בצד לקוח
        const cg = await getDocs(fsQuery(collectionGroup(db, "products"), limit(80)));
        const list = cg.docs.map(toProduct).filter((p) => {
          const t = (p.title || "").toLowerCase();
          const c = (p.category || "").toLowerCase();
          return t.includes(termLower) || c.includes(termLower);
        });
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [dq]);

  // שומר חיפוש אחרון
  const saveRecent = (term: string) => {
    if (!term.trim()) return;
    const next = [term, ...recent.filter((x) => x !== term)].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const empty = !loading && dq && results.length === 0;

  // כפתור טריגר (בדסקטופ)
  const Trigger = (
    <button
      onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 transition"
      aria-label="Open search"
      title="Press / to search"
    >
      <SearchIcon className="w-4 h-4" />
      <span className="text-sm">Search</span>
      <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/15">/</kbd>
    </button>
  );

  return (
    <>
      {Trigger}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white text-zinc-900 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <SearchIcon className="w-5 h-5 text-zinc-700" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="חיפוש מוצרים, קטגוריות וקישורי אתר…"
                className="flex-1 outline-none bg-transparent text-zinc-900 placeholder:text-zinc-600"
              />
              <button
                className="rounded-md p-1 hover:bg-zinc-100"
                onClick={() => setOpen(false)}
                aria-label="Close search"
              >
                <X className="w-5 h-5 text-zinc-700" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Recent + Quick links */}
              {!dq && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 mb-2">חיפושים אחרונים</h4>
                    {recent.length === 0 ? (
                      <p className="text-sm text-zinc-900">אין עדיין חיפושים.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => setQ(r)}
                            className="text-sm text-zinc-900 px-3 py-1 rounded-full border border-zinc-200 hover:bg-zinc-50"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 mb-2">קישורים מהירים</h4>
                    <div className="flex flex-wrap gap-2">
                      {quickLinks.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="text-sm text-zinc-900 px-3 py-1 rounded-full border border-zinc-200 hover:bg-zinc-50"
                          onClick={() => setOpen(false)}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && dq && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-xl bg-zinc-100 animate-pulse" />
                  ))}
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      href={p.href || `/product/${p.id}`}
                      className="group rounded-xl overflow-hidden border hover:shadow-sm transition"
                      onClick={() => {
                        saveRecent(dq);
                        setOpen(false);
                      }}
                    >
                      <div className="relative aspect-[4/5] bg-zinc-100">
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition"
                        />
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-medium text-zinc-900 line-clamp-1">{p.title}</div>
                        <div className="text-sm text-zinc-700">
                          {p.salePrice ? (
                            <>
                              <span className="font-semibold text-[#4b3a2f]">₪{p.salePrice}</span>
                              <span className="ml-2 line-through">₪{p.price}</span>
                            </>
                          ) : (
                            <span className="font-semibold text-[#4b3a2f]">₪{p.price}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {empty && (
                <div className="p-10 text-center text-zinc-900">
                  לא נמצאו תוצאות. נסי מילת חיפוש אחרת (למשל: “dress”, “pants”…)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
