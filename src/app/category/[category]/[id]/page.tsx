// app/category/[category]/[id]/page.tsx
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types";
import AddToCartClient from "@/components/AddToCartClient";
import Image from "next/image";
import { notFound } from "next/navigation";

type RouteParams = { category: string; id: string };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<RouteParams>; // ← ב-Next 15 params הוא Promise
}) {
  const { id } = await params; // ← חייבים await

  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    notFound();
  }

  const product = { id: snap.id, ...snap.data() } as Product;

  // נוודא שתמיד יש לנו מערך תמונות, ואם אין – נשתמש בפלייסהולדר
  const images: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["/no-image.png"];

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {/* תמונות */}
        <div>
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 shadow">
            <Image
              src={images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded overflow-hidden border"
                >
                  <Image
                    src={img}
                    alt={`${product.title} image ${i + 2}`}
                    fill
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* פרטי מוצר */}
        <div>
          <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-4">
            {product.title}
          </h1>
          {product.description && (
            <p className="text-lg text-gray-700 mb-4">{product.description}</p>
          )}

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
              <span className="text-2xl font-bold">
                ₪{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* כפתור הוספה לעגלה */}
          <AddToCartClient product={product} />
        </div>
      </div>
    </main>
  );
}
