// src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product, SizeOption } from "@/types";
import { auth } from "@/firebase";
import { addToCart } from "@/lib/cart";

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const firstInStock =
      product.sizes.find((s: SizeOption) => s.stock > 0)?.size ?? null;

    setLoading(true);
    try {
      await addToCart(user.uid, {
        productId: product.id,
        title: product.title,
        price: product.salePrice ?? product.price,
        image: product.images?.[0],
        category: product.category,
        size: firstInStock,
        color: product.colors?.[0] ?? null,
        qty: 1,
      });
      alert("Added to cart ✅");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      {/* לינק לדף המוצר */}
      <Link
        href={`/category/${product.category}/${product.id}`}
        className="block group"
      >
        <div className="relative w-full h-56"> {/* הקטנתי מ-h-64 ל-h-56 */}
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/category/${product.category}/${product.id}`}>
          <h3 className="text-base font-semibold text-[#3f2f26] line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <p className="mt-1 text-[#4b3a2f] font-bold">
          ₪{(product.salePrice ?? product.price).toFixed(2)}
          {product.salePrice && (
            <span className="ml-2 text-sm text-gray-400 line-through">
              ₪{product.price.toFixed(2)}
            </span>
          )}
        </p>

        <div className="flex gap-2 mt-2">
          {product.colors?.slice(0, 5).map((color: string) => (
            <span
              key={color}
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="mt-3 w-full rounded-full py-2 text-white bg-[#c8a18d] hover:bg-[#4b3a2f] transition disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
