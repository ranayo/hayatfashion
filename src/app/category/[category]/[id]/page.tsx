// app/category/[category]/[id]/page.tsx
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types";
import AddToCartClient from "@/components/AddToCartClient";

type Props = {
  params: { category: string; id: string };
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = params;

  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return <div className="p-10 text-center text-gray-500">Product not found.</div>;
  }

  const product = { id: snap.id, ...snap.data() } as Product;

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {/* תמונות */}
        <div>
          <img
            src={product.images?.[0] ?? "/no-image.png"}
            alt={product.title}
            className="w-full rounded-xl shadow"
          />
          <div className="flex gap-2 mt-4">
            {product.images?.slice(1).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${product.title} image ${i + 2}`}
                className="w-20 h-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>

        {/* פרטי מוצר */}
        <div>
          <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-4">{product.title}</h1>
          <p className="text-lg text-gray-700 mb-4">{product.description}</p>

          <div className="mb-4">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-bold text-red-600 mr-3">
                  ₪{product.salePrice.toFixed(2)}
                </span>
                <span className="text-lg line-through text-gray-500">
                  ₪{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">₪{product.price.toFixed(2)}</span>
            )}
          </div>

          {/* כפתור הוספה לעגלה */}
          <AddToCartClient product={product} />
        </div>
      </div>
    </main>
  );
}
