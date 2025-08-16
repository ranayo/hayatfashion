import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image?: string | null;
  category: string;
  size?: string | null;
  color?: string | null;
  qty: number;
};

// נייצר מפתח שמאחד פריט לפי מוצר+מידה+צבע
function keyOf(item: Pick<CartItem, "productId" | "size" | "color">) {
  return [item.productId, item.size ?? "-", item.color ?? "-"].join("__");
}

export async function addToCart(uid: string, item: CartItem) {
  const cartCol = collection(db, "users", uid, "cart");
  const id = keyOf(item);
  const ref = doc(cartCol, id);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { qty: increment(item.qty) });
  } else {
    await setDoc(ref, { ...item });
  }
}

export async function removeFromCart(uid: string, item: Pick<CartItem, "productId" | "size" | "color">) {
  const id = keyOf(item);
  await deleteDoc(doc(db, "users", uid, "cart", id));
}
