// src/hooks/useCart.ts
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { listenToCart, addToCart, setItemQty, removeFromCart, sumTotal } from "@/lib/cart";

export default function useCart() {
  const [items, setItems] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribeCart: undefined | (() => void);

    const off = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);

      // מנתקים האזנה קודמת (אם הייתה)
      if (unsubscribeCart) {
        unsubscribeCart();
        unsubscribeCart = undefined;
      }

      if (u) {
        // מאזינים לעגלה של המשתמש הנוכחי
        unsubscribeCart = listenToCart(setItems, u.uid);
      } else {
        setItems([]);
      }
    });

    return () => {
      off();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, []);

  const total = sumTotal(items);

  return {
    user, ready, items, total,
    addToCart,
    setItemQty,
    removeFromCart,
  };
}
