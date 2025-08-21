// src/hooks/useCart.ts
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { listenToCart, addToCart, setItemQty, removeFromCart } from "@/lib/cart";

export default function useCart() {
  const [items, setItems] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
      if (u) {
        const unsub = listenToCart(setItems);
        return () => unsub();
      } else {
        setItems([]);
      }
    });
    return () => off();
  }, []);

  const total = items.reduce((s, it) => s + (it.data.price || 0) * (it.data.qty || 0), 0);

  return {
    user, ready, items, total,
    addToCart,
    setItemQty,
    removeFromCart,
  };
}
