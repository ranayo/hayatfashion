// src/lib/cart.ts
import { auth, db } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

/** מזהה מסמך בעגלה לפי מוצר+מידה+צבע */
export function cartDocId(productId: string, size?: string | null, color?: string | null) {
  return `${productId}__${size ?? "-"}__${color ?? "-"}`;
}

/** מודל פריט בסל (מיושר לכללי האבטחה) */
export type CartItem = {
  id?: string;            // נוח לרינדור
  productId: string;
  title: string;
  price: number;
  image?: string | null;
  category?: string;
  size?: string | null;
  color?: string | null;
  qty: number;
  updatedAt?: any;
  createdAt?: any;
};

/** קלט להוספה לעגלה */
export type AddToCartInput = {
  productId: string;
  title: string;
  price: number;      // חייב להיות שווה ל-productPrice(productId) לפי ה-Rules
  image?: string | null;
  category?: string;
  size?: string | null;
  color?: string | null;
  qty: number;        // לרוב 1
};

function ensureUid(uid?: string) {
  if (uid) return uid;
  const u = auth.currentUser;
  if (!u) throw new Error("LOGIN_REQUIRED");
  return u.uid;
}

/** 🔔 האזנה חיה לעגלה (users/{uid}/cart) */
export function listenToCart(cb: (items: CartItem[]) => void, uid?: string) {
  try {
    const theUid = ensureUid(uid);
    const colRef = collection(db, "users", theUid, "cart");
    return onSnapshot(colRef, (snap) => {
      const items: CartItem[] = snap.docs.map((d) => {
        const x = d.data() as any;
        return {
          id: d.id,
          productId: String(x.productId),
          title: String(x.title ?? ""),
          price: Number(x.price ?? 0),
          image: x.image ?? null,
          category: x.category ?? "",
          size: x.size ?? null,
          color: x.color ?? null,
          qty: Number(x.qty ?? 1),
          updatedAt: x.updatedAt,
          createdAt: x.createdAt,
        };
      });
      cb(items);
    });
  } catch {
    return () => {};
  }
}

/** ➕ הוספה/מיזוג לעגלה (users/{uid}/cart) */
export async function addToCart(input: AddToCartInput, uid?: string) {
  const theUid = ensureUid(uid);
  const id = cartDocId(input.productId, input.size ?? null, input.color ?? null);
  const ref = doc(db, "users", theUid, "cart", id);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    const prev = snap.data() as any;
    const prevQty = Number(prev?.qty ?? 0);
    await updateDoc(ref, {
      qty: prevQty + (input.qty || 1),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      productId: input.productId,
      title: input.title,
      price: input.price,              // ה-Rules בודקים שזה תואם למחיר המוצר
      image: input.image ?? null,
      category: input.category ?? "",
      size: input.size ?? null,
      color: input.color ?? null,
      qty: input.qty || 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/** ✏️ קובע כמות (0 ומטה => מחיקה) */
export async function setItemQty(
  ident: { productId: string; size?: string | null; color?: string | null },
  qty: number,
  uid?: string
) {
  const theUid = ensureUid(uid);
  const ref = doc(db, "users", theUid, "cart", cartDocId(ident.productId, ident.size ?? null, ident.color ?? null));
  if (qty <= 0) {
    await deleteDoc(ref);
  } else {
    await updateDoc(ref, { qty, updatedAt: serverTimestamp() });
  }
}

/** 🗑️ הסרת פריט */
export async function removeFromCart(
  ident: { productId: string; size?: string | null; color?: string | null },
  uid?: string
) {
  const theUid = ensureUid(uid);
  const ref = doc(db, "users", theUid, "cart", cartDocId(ident.productId, ident.size ?? null, ident.color ?? null));
  await deleteDoc(ref);
}
