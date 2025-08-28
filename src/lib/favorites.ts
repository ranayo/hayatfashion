// src/lib/favorites.ts
import { auth, db } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";

export type FavoriteItem = {
  productId: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image?: string | null;
  category?: string;
  createdAt?: any;
};

function ensureUid(uid?: string) {
  if (uid) return uid;
  const u = auth.currentUser;
  if (!u) throw new Error("LOGIN_REQUIRED");
  return u.uid;
}

function favRef(uid: string, productId: string) {
  return doc(db, "users", uid, "favorites", productId);
}

export async function addFavorite(item: FavoriteItem, uid?: string) {
  const theUid = ensureUid(uid);
  await setDoc(favRef(theUid, item.productId), {
    ...item,
    salePrice:
      item.salePrice == null || Number.isNaN(Number(item.salePrice))
        ? null
        : Number(item.salePrice),
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(productId: string, uid?: string) {
  const theUid = ensureUid(uid);
  await deleteDoc(favRef(theUid, productId));
}

export function listenFavorites(
  cb: (items: Array<{ id: string; data: FavoriteItem }>) => void,
  uid?: string
): Unsubscribe {
  const theUid = ensureUid(uid);
  const col = collection(db, "users", theUid, "favorites");
  return onSnapshot(col, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        data: d.data() as FavoriteItem,
      }))
    );
  });
}
