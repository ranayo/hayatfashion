// src/hooks/useCart.ts
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { addToCart as addToCartAPI } from "@/lib/cart";

/** פריט עגלה לתצוגה (תואם גם לשמות החדשים וגם לישנים) */
export type CartItem = {
  id: string;
  productId: string;
  title: string;
  price: number;

  // שדות חדשים:
  image: string | null;
  qty: number;

  // אליאסים לאחור (כדי לא לשבור קומפוננטים קיימים):
  imageUrl?: string;     // = image
  quantity?: number;     // = qty

  size?: string | null;
  color?: string | null;
  updatedAt?: any;
};

function mapDoc(d: any): CartItem {
  const x = d.data() as any;
  const image =
    typeof x.image === "string" && x.image.trim() ? x.image : null;
  const qty = Number(x.qty ?? x.quantity ?? 1) || 1;

  return {
    id: d.id,
    productId: String(x.productId),
    title: String(x.title ?? ""),
    price: Number(x.price ?? 0),
    image,
    qty,
    // אליאסים:
    imageUrl: image ?? undefined,
    quantity: qty,
    size: x.size ?? null,
    color: x.color ?? null,
    updatedAt: x.updatedAt,
  };
}

/** ה־hook */
export function useCart() {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true); // מה ששאר הקוד מצפה לו
  const [ready, setReady] = useState(false);    // למי שצריך

  // מאזין לסטטוס התחברות ומחבר מאזין לעגלה: users/{uid}/cart
  useEffect(() => {
    let offCart: (() => void) | null = null;

    const offAuth = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      setReady(true);

      if (offCart) {
        offCart();
        offCart = null;
      }

      if (!u) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const colRef = collection(db, "users", u.uid, "cart");
      offCart = onSnapshot(
        colRef,
        (snap) => {
          setItems(snap.docs.map(mapDoc));
          setLoading(false);
        },
        () => setLoading(false)
      );
    });

    return () => {
      offAuth();
      if (offCart) offCart();
    };
  }, []);

  // סכומים
  const totalQuantity = useMemo(
    () => items.reduce((s, it) => s + (Number(it.qty) || 0), 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0),
    [items]
  );

  // פעולות
  const addToCart = useCallback(
    async (payload: {
      productId: string;
      title: string;
      price: number;
      image?: string | null;
      imageUrl?: string | null; // תמיכה אחורה
      size?: string | null;
      color?: string | null;
      qty?: number;
      quantity?: number;        // תמיכה אחורה
    }) => {
      if (!uid) throw new Error("נדרש להתחבר כדי להוסיף לעגלה.");

      const image = payload.image ?? payload.imageUrl ?? null;
      const qty = Number(payload.qty ?? payload.quantity ?? 1) || 1;

      await addToCartAPI({
        productId: payload.productId,
        title: payload.title,
        price: Number(payload.price),
        image,
        size: payload.size ?? null,
        color: payload.color ?? null,
        qty,
      }, uid);
    },
    [uid]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (!uid) return;
      const ref = doc(db, "users", uid, "cart", cartItemId);
      await updateDoc(ref, { qty: Math.max(1, Number(quantity) || 1) });
    },
    [uid]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      if (!uid) return;
      const ref = doc(db, "users", uid, "cart", cartItemId);
      await deleteDoc(ref);
    },
    [uid]
  );

  const clearCart = useCallback(async () => {
    if (!uid) return;
    const colRef = collection(db, "users", uid, "cart");
    const snap = await getDocs(colRef);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }, [uid]);

  // החזרה – עם תאימות מלאה לשמות ששאר הקוד משתמש בהם
  return {
    uid,
    loading,        // מה שהקומפוננטים מצפים
    ready,          // אם תרצי להשתמש
    items,          // כולל גם imageUrl/quantity לאחור
    totalQuantity,  // מה שהקומפוננטים מצפים
    totalPrice,
    // אליאס למי שמשתמש totalQty:
    totalQty: totalQuantity,

    addToCart,
    updateQuantity, // (id, qty)
    removeItem,     // (id)
    clearCart,
  };
}

// גם default וגם named – כדי לכסות את כל סוגי ה-importים בפרויקט
export default useCart;
