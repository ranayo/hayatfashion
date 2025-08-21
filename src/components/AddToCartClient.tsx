// src/components/AddToCartClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, SizeOption } from "@/types";
import { addToCart } from "@/lib/cart";

/** ממפה מחרוזות צבע ל-Tailwind classes */
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

export default function AddToCartClient({ product }: { product: Product }) {
  const router = useRouter();

  const [color, setColor] = useState<string | null>(product.colors?.[0] ?? null);
  const [size, setSize] = useState<string | null>(
    product.sizes?.find((s: SizeOption) => s.stock > 0)?.size ?? null
  );
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      await addToCart({
        productId: product.id,
        title: product.title,
        price: product.salePrice ?? product.price,
        image: product.images?.[0] ?? null,
        category: product.category,
        size,
        color,
        qty,
      });
      router.push("/cart");
    } catch (e: any) {
      if (e?.message === "LOGIN_REQUIRED") router.push("/login");
      else {
        console.error(e);
        alert("Failed to add to cart");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Color */}
      <div>
        <h3 className="font-medium mb-2">Color</h3>
        <div className="flex gap-2" role="group" aria-label="Choose color">
          {product.colors?.map((c: string) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={`Color ${c}`}
              aria-label={`Select color ${c}`}
              className={`w-7 h-7 rounded-full border ${color === c ? "ring-2 ring-[#c8a18d]" : ""} ${colorClass(c)}`}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="font-medium mb-2">Size</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose size">
          {product.sizes?.map((s: SizeOption) => (
            <button
              key={s.size}
              onClick={() => s.stock > 0 && setSize(s.size)}
              disabled={s.stock === 0}
              title={s.stock === 0 ? `${s.size} (out of stock)` : `Size ${s.size}`}
              className={`px-3 py-1 border rounded ${
                size === s.size ? "bg-[#f6f2ef] border-[#c8a18d]" : ""
              } disabled:opacity-50`}
            >
              {s.size}
            </button>
          ))}
        </div>
      </div>

      {/* Qty */}
      <div className="flex items-center gap-2">
        <label htmlFor="qty-input" className="text-sm w-16">
          Qty:
        </label>
        <input
          id="qty-input"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-20 border rounded px-2 py-1"
          aria-label="Quantity"
          inputMode="numeric"
        />
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={loading || !size}
        className="w-full rounded-full py-3 text-white bg-[#c8a18d] hover:bg-[#4b3a2f] transition disabled:opacity-60"
      >
        {loading ? "Adding..." : "ADD TO CART"}
      </button>
    </div>
  );
}
