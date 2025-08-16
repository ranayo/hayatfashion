import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductById } from "@/firebase/products";
import AddToCartClient from "@/components/AddToCartClient";
import type { Product } from "@/types";

export default async function ProductPage({ params }: { params: {category:string; id:string} }) {
  const product = (await getProductById(params.id)) as Product | null;
  if (!product || product.category !== params.category) return notFound();

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow">
        <div className="relative w-full h-[560px] rounded-lg overflow-hidden">
          <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
        </div>
        <section>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#3f2f26]">{product.title}</h1>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-2xl font-bold text-[#4b3a2f]">₪{(product.salePrice ?? product.price).toFixed(2)}</div>
            {product.salePrice && <div className="text-gray-400 line-through">₪{product.price.toFixed(2)}</div>}
          </div>
          <AddToCartClient product={product} />
        </section>
      </div>
    </main>
  );
}
