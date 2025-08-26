// src/app/category/[category]/page.tsx
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { getCategoryBySlug } from "@/data/categories";
import Link from "next/link";

type Props = { params: { category: string } };

export default async function CategoryPage({ params }: Props) {
  // נורמל ל-lowercase – כך בדיוק שומרים במסמכים
  const slug = params.category.toLowerCase();

  // וידוא שהקטגוריה חוקית (לכותרת יפה ומניעת 404 מיותר)
  const cat = getCategoryBySlug(slug);
  if (!cat) {
    return (
      <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-6 text-[#4b3a2f]">
          Category not found
        </h1>
        <p className="text-center text-gray-500">
          The requested category doesn&apos;t exist.{" "}
          <Link href="/category" className="underline">Back to all categories</Link>
        </p>
      </main>
    );
  }

  // שליפת מוצרים ששדה category שלהם תואם ל-slug
  const q = query(collection(db, "products"), where("category", "==", slug));
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold text-center mb-10 text-[#4b3a2f]">
        {cat.title} Collection
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
