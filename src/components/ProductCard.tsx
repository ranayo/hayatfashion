// src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product, SizeOption } from "@/types";
import { addToCart } from "@/lib/cart";

function colorClass(c: string | null | undefined) {
  if (!c) return "bg-gray-300";
  const v = c.trim().toLowerCase();
  if (["black", "#000", "שחור"].includes(v)) return "bg-black";
  if (["white", "#fff", "לבן"].includes(v)) return "bg-white";
  if (["beige", "#f5f5dc"].includes(v)) return "bg-amber-100";
  if (["brown", "#6b4f3a"].includes(v)) return "bg-amber-800";
  if (["cream", "קרם"].includes(v)) return "bg-orange-100";
  if (["gray", "grey", "#808080", "אפור"].includes(v)) return "bg-gray-400";
  if (["navy", "blue", "כחול"].includes(v)) return "bg-blue-600";
  if (["green", "ירוק"].includes(v)) return "bg-green-600";
  if (["red", "בורדו", "wine", "maroon"].includes(v)) return "bg-red-700";
  return "bg-gray-300";
}

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    const firstInStock =
      product.sizes.find((s: SizeOption) => s.stock > 0)?.size ?? null;

    setLoading(true);
    try {
      await addToCart({
        productId: product.id,
        title: product.title,
        price: product.salePrice ?? product.price,
        image: product.images?.[0] ?? null,
        category: product.category,
        size: firstInStock,
        color: product.colors?.[0] ?? null,
        qty: 1,
      });
      alert("Added to cart ✅");
    } catch (e: any) {
      if (e?.message === "LOGIN_REQUIRED") {
        router.push("/login");
      } else {
        console.error(e);
        alert("Failed to add to cart");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      <Link
        href={`/category/${product.category}/${product.id}`}
        className="block group"
        aria-label={`Open ${product.title} details`}
      >
        <div className="relative w-full h-56">
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

        <div className="flex gap-2 mt-2" role="group" aria-label="Available colors">
          {product.colors?.slice(0, 5).map((c: string) => (
            <span
              key={c}
              className={`w-4 h-4 rounded-full border ${colorClass(c)}`}
              title={c}
              aria-label={`Color ${c}`}
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
