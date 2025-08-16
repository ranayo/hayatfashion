// src/firebase/products.ts
import { db } from "@/firebase"; // חשוב: שיהיה export db מ-src/firebase/index.ts
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// אם יש לך types בקובץ אחר, עדכני את הנתיב:
import { Product } from "@/types";

export async function getProductById(id: string): Promise<Product | null> {
  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as Product;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const q = query(collection(db, "products"), where("category", "==", category));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Product[];
}
