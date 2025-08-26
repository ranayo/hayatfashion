// src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product, SizeOption } from "@/types";
import { addToCart } from "@/lib/cart";
import { auth } from "@/firebase";
import { toast } from "sonner";

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

  // ✅ fallback לתמונה במקרה של URL שגוי/חסום
  const [imgSrc, setImgSrc] = useState<string>(
    product.images?.[0] ?? "/no-image.png"
  );

  const catSlug = String(product.category || "").toLowerCase();

  async function handleAdd() {
    const sizeInStock: string | null =
      product.sizes?.find((s: SizeOption) => (s?.stock ?? 0) > 0)?.size ?? null;

    const color: string | null = product.colors?.[0] ?? null;

    if (!auth.currentUser) {
      toast.error("יש להתחבר כדי להוסיף לעגלה");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await addToCart({
        productId: product.id,
        title: product.title,
        price: product.salePrice ?? product.price,
        image: imgSrc || null,
        category: catSlug,
        size: sizeInStock,
        color,
        qty: 1,
      });
      toast.success("הפריט נוסף לעגלה");
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("LOGIN_REQUIRED")) {
        router.push("/login");
        toast.error("יש להתחבר כדי להוסיף לעגלה");
      } else if (msg.toLowerCase().includes("permission")) {
        toast.error("אין הרשאה לעדכן עגלה. ודאי שהתחברת והמייל מאומת.");
      } else {
        console.error(e);
        toast.error("שגיאה בהוספה לעגלה");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
      <Link
        href={`/category/${catSlug}/${product.id}`}
        className="block group"
        aria-label={`Open ${product.title} details`}
      >
        <div className="relative w-full h-56">
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition"
            onError={() => setImgSrc("/no-image.png")}
            priority={false}
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/category/${catSlug}/${product.id}`}>
          <h3 className="text-base font-semibold text-[#3f2f26] line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <p className="mt-1 text-[#4b3a2f] font-bold">
          ₪{Number(product.salePrice ?? product.price).toFixed(2)}
          {product.salePrice && (
            <span className="ml-2 text-sm text-gray-400 line-through">
              ₪{Number(product.price).toFixed(2)}
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
