"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/lib/cart";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }
    const col = collection(db, "users", user.uid, "cart");
    const unsub = onSnapshot(col, (snap) => {
      setItems(snap.docs.map((d) => d.data() as CartItem));
    });
    return () => unsub();
  }, [router]);

  async function updateQty(item: CartItem, qty: number) {
    if (!auth.currentUser) return;
    const ref = doc(db, "users", auth.currentUser.uid, "cart", `${item.productId}__${item.size ?? "-"}__${item.color ?? "-"}`);
    if (qty <= 0) {
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, { qty });
    }
  }

  async function removeItem(item: CartItem) {
    if (!auth.currentUser) return;
    const ref = doc(db, "users", auth.currentUser.uid, "cart", `${item.productId}__${item.size ?? "-"}__${item.color ?? "-"}`);
    await deleteDoc(ref);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

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
              {items.map((it) => (
                <li
                  key={`${it.productId}-${it.size}-${it.color}`}
                  className="py-4 flex gap-4 items-center"
                >
                  {it.image && (
                    <div className="relative w-20 h-24 flex-shrink-0">
                      <Image
                        src={it.image}
                        alt={it.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}

                  {/* פרטים */}
                  <div className="flex-1">
                    <div className="font-medium text-[#3f2f26]">
                      {it.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {it.size && <>Size: {it.size} · </>}
                      {it.color && <>Color: {it.color}</>}
                    </div>

                    {/* כמות */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(it, it.qty - 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center">{it.qty}</span>
                      <button
                        onClick={() => updateQty(it, it.qty + 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* מחיר + מחיקה */}
                  <div className="text-right">
                    <div className="font-semibold text-[#4b3a2f]">
                      ₪{(it.price * it.qty).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(it)}
                      className="mt-2 text-sm text-red-500 hover:text-red-700"
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
                Total: ₪{total.toFixed(2)}
              </div>
              <button className="px-6 py-2 rounded-full bg-[#c8a18d] text-white hover:bg-[#4b3a2f] transition">
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
