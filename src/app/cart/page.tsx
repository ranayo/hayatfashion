// src/app/cart/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useCart, { type CartItem } from "@/hooks/useCart";

const fmt = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
});

export default function CartPage() {
  // כל ניהול העגלה מגיע מה-hook: מאזין חי, סכומים, פעולות
  const { uid, loading, items, totalPrice, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  // אם אין משתמש מחובר – מעבירים ללוגין (אחרי שהטעינה הסתיימה)
  useEffect(() => {
    if (!loading && !uid) router.push("/login");
  }, [loading, uid, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
        <h1 className="text-3xl font-semibold text-center mb-8 text-[#4b3a2f]">
          Your Cart
        </h1>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">טוען…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8 text-[#4b3a2f]">
        Your Cart
      </h1>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-4 md:p-6">
        {items.length === 0 ? (
          <p className="text-center text-gray-600">
            Cart is empty.{" "}
            <Link href="/" className="underline">
              Continue shopping
            </Link>
          </p>
        ) : (
          <>
            <ul className="divide-y">
              {items.map((it: CartItem) => (
                <li key={it.id} className="py-4 flex gap-4 items-center">
                  <div className="relative w-20 h-24 flex-shrink-0">
                    <Image
                      src={it.imageUrl || "/product-1.png"}
                      alt={it.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* פרטים */}
                  <div className="flex-1">
                    <div className="font-medium text-[#3f2f26]">
                      <Link href={`/product/${encodeURIComponent(it.productId)}`}>
                        {it.title}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      {it.size && <>Size: {it.size} · </>}
                      {it.color && <>Color: {it.color}</>}
                    </div>

                    {/* כמות */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(it.id!, Math.max(1, (it.quantity || 1) - 1))}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                        aria-label="Decrease quantity"
                        type="button"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center">{it.quantity ?? 1}</span>
                      <button
                        onClick={() => updateQuantity(it.id!, (it.quantity || 0) + 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                        aria-label="Increase quantity"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* מחיר + מחיקה */}
                  <div className="text-right">
                    <div className="font-semibold text-[#4b3a2f]">
                      {fmt.format((Number(it.price) || 0) * (Number(it.quantity) || 0))}
                    </div>
                    <button
                      onClick={() => removeItem(it.id!)}
                      className="mt-2 text-sm text-red-500 hover:text-red-700"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* סיכום */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-lg font-semibold text-[#4b3a2f]">
                Total: {fmt.format(totalPrice)}
              </div>
              <Link
                href="/checkout"
                className="px-6 py-2 rounded-full bg-[#c8a18d] text-white hover:bg-[#4b3a2f] transition"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
