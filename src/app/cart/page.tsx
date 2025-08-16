"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
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

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8 text-[#4b3a2f]">Your Cart</h1>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-4 md:p-6">
        {items.length === 0 ? (
          <p className="text-center text-gray-600">
            Cart is empty. <Link href="/" className="underline">Continue shopping</Link>
          </p>
        ) : (
          <>
            <ul className="divide-y">
              {items.map((it) => (
                <li key={`${it.productId}-${it.size}-${it.color}`} className="py-4 flex gap-4">
                  {it.image && (
                    <div className="relative w-20 h-24 flex-shrink-0">
                      <Image src={it.image} alt={it.title} fill className="object-cover rounded" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-sm text-gray-500">
                      {it.size && <>Size: {it.size} · </>}
                      {it.color && <>Color: {it.color}</>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₪{(it.price * it.qty).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Qty: {it.qty}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-lg font-semibold text-[#4b3a2f]">Total: ₪{total.toFixed(2)}</div>
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
