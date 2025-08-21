// app/category/[category]/page.tsx
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

type Props = {
  params: { category: string };
};

export default async function CategoryPage({ params }: Props) {
  const { category } = params;

  const q = query(collection(db, "products"), where("category", "==", category));
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold text-center mb-10 text-[#4b3a2f] capitalize">
        {category} Collection
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products found in this category.</p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
