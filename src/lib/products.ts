import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Product, SizeOption } from "@/types";

export async function fetchProductsByCategory(category: Product["category"]) {
  const ref = collection(db, "products");
  const q = query(
    ref,
    where("category", "==", category),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
}
