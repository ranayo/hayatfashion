// src/lib/cart.ts
import { db } from "@/firebase";
import { auth } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";

/** מודל פריט בסל */
export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image?: string | null;
  category: string;
  size?: string | null;
  color?: string | null;
  qty: number;
  updatedAt?: any;
};

/** מזהה יחודי לפי מוצר+מידה+צבע (כדי לאחד פריטים דומים) */
function keyOf(item: Pick<CartItem, "productId" | "size" | "color">) {
  return [item.productId, item.size ?? "-", item.color ?? "-"].join("__");
}

/** דואג ל-user id: אם לא הועבר uid כפראמטר – נשתמש במשתמש המחובר */
function ensureUid(uid?: string) {
  if (uid) return uid;
  const u = (auth as any).currentUser as { uid: string } | null;
  if (!u) throw new Error("LOGIN_REQUIRED");
  return u.uid;
}

/** 🔼 הוספה לסל (אם קיים – מעלה כמות) */
export async function addToCart(item: CartItem, uid?: string) {
  const theUid = ensureUid(uid);
  const cartCol = collection(db, "users", theUid, "cart");
  const id = keyOf(item);
  const ref = doc(cartCol, id);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      qty: increment(item.qty || 1),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      ...item,
      qty: item.qty || 1,
      updatedAt: serverTimestamp(),
    });
  }
}

/** ✏️ קובע כמות ישירה (qty<=0 מוחק) */
export async function setItemQty(
  ident: Pick<CartItem, "productId" | "size" | "color">,
  qty: number,
  uid?: string
) {
  const theUid = ensureUid(uid);
  const id = keyOf(ident);
  const ref = doc(db, "users", theUid, "cart", id);
  if (qty <= 0) {
    await deleteDoc(ref);
    return;
  }
  await updateDoc(ref, { qty, updatedAt: serverTimestamp() });
}

/** 🗑️ מחיקת פריט */
export async function removeFromCart(
  ident: Pick<CartItem, "productId" | "size" | "color">,
  uid?: string
) {
  const theUid = ensureUid(uid);
  const id = keyOf(ident);
  await deleteDoc(doc(db, "users", theUid, "cart", id));
}

export async function updateCartQty(
  uid: string,
  item: Pick<CartItem, "productId" | "size" | "color">,
  qty: number
) {
  const id = keyOf(item);
  const ref = doc(db, "users", uid, "cart", id);

  if (qty <= 0) {
    await deleteDoc(ref);
  } else {
    await updateDoc(ref, { qty });
  }
}


/** 🔔 האזנה חיה לסל של המשתמש (UI יתעדכן אוטומטית) */
export function listenToCart(
  cb: (items: Array<{ id: string; data: CartItem }>) => void,
  uid?: string
) {
  try {
    const theUid = ensureUid(uid);
    const colRef = collection(db, "users", theUid, "cart");
    return onSnapshot(colRef, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        data: d.data() as CartItem,
      }));
      cb(items);
    });
  } catch {
    // לא מחובר? לא מאזינים
    return () => {};
  }
}
