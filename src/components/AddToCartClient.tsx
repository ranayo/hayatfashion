"use client";
import { SizeOption } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { auth } from "@/firebase";
import { addToCart } from "@/lib/cart";

export default function AddToCartClient({ product }: { product: Product }) {
  const router = useRouter();
  const [color, setColor] = useState<string | null>(product.colors?.[0] ?? null);
  const [size, setSize] = useState<string | null>(
    product.sizes?.find((s: SizeOption) => s.stock > 0)?.size ?? null
  );
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    const user = auth.currentUser;
    if (!user) return router.push("/login");

    setLoading(true);
    try {
      await addToCart(user.uid, {
        productId: product.id,
        title: product.title,
        price: product.salePrice ?? product.price,
        image: product.images?.[0],
        category: product.category,
        size,
        color,
        qty,
      });
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Color */}
      <div>
        <h3 className="font-medium mb-2">Color</h3>
        <div className="flex gap-2">
          {product.colors?.map((c: string) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border ${color === c ? "ring-2 ring-[#c8a18d]" : ""}`}
              style={{ backgroundColor: c.toLowerCase() }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="font-medium mb-2">Size</h3>
        <div className="flex flex-wrap gap-2">
          {product.sizes?.map((s: SizeOption) => (
            <button
              key={s.size}
              onClick={() => s.stock > 0 && setSize(s.size)}
              disabled={s.stock === 0}
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
        <span className="text-sm w-16">Qty:</span>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-20 border rounded px-2 py-1"
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
