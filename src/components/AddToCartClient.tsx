"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addToCart } from "@/lib/cart";
import { auth } from "@/firebase/config"; // ✅ שימוש ב-auth הנכון

type ProductForAdd = {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null;
  images?: string[];
  image?: string;
  colors?: string[];
  sizes?: any[] | Record<string, unknown>;
  currency?: string;
  category?: string;
};

const CANONICAL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const canonSize = (s: string) =>
  s.replace(/\s+/g, "").toUpperCase().replace("X-S", "XS").replace("X-L", "XL");

const colorClass: Record<string, string> = {
  black: "bg-black",
  white: "bg-white ring-1 ring-gray-300",
  beige: "bg-amber-200",
  pink: "bg-pink-400",
  blue: "bg-blue-500",
  green: "bg-green-500",
  gray: "bg-gray-400",
  grey: "bg-gray-400",
  brown: "bg-amber-800",
};

export default function AddToCartClient({ product }: { product: ProductForAdd }) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; text: string } | null>(null);

  // ✅ מאזין למצב ההתחברות של אותו auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const priceToCharge =
    product.salePrice != null ? Number(product.salePrice) : Number(product.price);

  const mainImage =
    (Array.isArray(product.images) && typeof product.images[0] === "string" && product.images[0]) ||
    (typeof product.image === "string" && product.image) ||
    "/product-1.png";

  const availableSizes = useMemo(() => {
    if (!product.sizes) return new Set<string>();
    if (Array.isArray(product.sizes)) {
      return new Set(product.sizes.map((s) => canonSize(String((s as any).name ?? s))));
    }
    if (typeof product.sizes === "object") {
      const s = new Set<string>();
      for (const k of Object.keys(product.sizes as Record<string, unknown>)) {
        const qty = Number((product.sizes as any)[k] ?? 0);
        if (!Number.isNaN(qty) && qty > 0) s.add(canonSize(k));
      }
      return s;
    }
    return new Set<string>();
  }, [product.sizes]);

  const hasSizes = availableSizes.size > 0;
  const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
  const disabled = (hasSizes && !size) || (hasColors && !color);

  async function onAdd() {
    if (authLoading) {
      setMsg({ t: "err", text: "בודק התחברות..." });
      return;
    }

    if (!user) {
      setMsg({ t: "err", text: "אנא התחברי לפני הוספה לעגלה" });
      return;
    }

    if (disabled) {
      setMsg({ t: "err", text: "בחרי מידה/צבע לפני הוספה" });
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        title: product.title ?? "Product",
        price: priceToCharge,
        image: mainImage ?? null,
        category: product.category ?? "",
        size: size ?? null,
        color: color ?? null,
        qty: 1,
      });
      setMsg({ t: "ok", text: "התווסף לעגלה!" });
      setTimeout(() => setMsg(null), 2000);
    } catch (e: any) {
      setMsg({ t: "err", text: e?.message || "שגיאה בהוספה לעגלה" });
    }
  }

  return (
    <div className="space-y-4">
      {/* צבעים */}
      <div className="space-y-2">
        <div className="text-[#4b3a2f] font-medium">Color</div>
        <div className="flex items-center gap-2">
          {hasColors ? (
            product.colors!.map((cRaw) => {
              const c = String(cRaw).trim();
              const isSelected = color === c;
              const mapped = colorClass[c.toLowerCase()] ?? "";
              const baseRing =
                c.toLowerCase() === "white" ? "ring-1 ring-gray-300" : "ring-1 ring-black/10";

              return (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  aria-pressed={isSelected}
                  onClick={() => setColor(c)}
                  className={[
                    "h-6 w-6 rounded-full transition",
                    baseRing,
                    isSelected ? "ring-2 ring-[#c8a18d]" : "",
                    mapped || "bg-gray-200",
                  ].join(" ")}
                  title={c}
                />
              );
            })
          ) : (
            <span className="text-sm text-[#7e6d65]">—</span>
          )}
        </div>
      </div>

      {/* מידות */}
      <div className="space-y-2">
        <div className="text-[#4b3a2f] font-medium">Size</div>
        <div className="flex flex-wrap items-center gap-2">
          {CANONICAL_SIZES.map((s) => {
            const isAvailable = !hasSizes || availableSizes.has(s);
            const isSelected = size === s;

            return (
              <button
                key={s}
                type="button"
                disabled={!isAvailable}
                aria-pressed={isSelected}
                onClick={() => isAvailable && setSize(s)}
                className={[
                  "h-9 min-w-9 rounded-full px-3 text-sm transition ring-1",
                  isSelected
                    ? "bg-[#c8a18d] text-white ring-[#c8a18d]"
                    : isAvailable
                    ? "bg-white text-[#4b3a2f] hover:bg-[#f6f2ef] ring-[#e5ddd7]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed ring-[#e5ddd7]",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* כפתור הוספה */}
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled || authLoading}
        className={`w-full rounded-full px-6 py-3 font-semibold transition
          ${
            disabled || authLoading
              ? "bg-[#c8a18d]/50 text-white cursor-not-allowed"
              : "bg-[#c8a18d] text-white hover:bg-[#4b3a2f]"
          }
        `}
      >
        {authLoading ? "בודק התחברות..." : user ? "Add to Cart" : "Login Required"}
      </button>

      {msg && (
        <div
          role="status"
          className={`text-sm ${msg.t === "ok" ? "text-green-700" : "text-red-600"}`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
