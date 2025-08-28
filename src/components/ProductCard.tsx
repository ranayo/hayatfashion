// src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export type Product = {
  id: string;
  title: string;
  price: number;
  salePrice?: number;
  currency?: string;
  category?: string;
  images?: string[];
  image?: string;
  rating?: number;
  colors?: string[];
  sizes?: any[];
  description?: string;
  isActive?: boolean;
};

type Props = { product: Product };

const fmt = (v: number, cur = "ILS") =>
  Intl.NumberFormat("he-IL", { style: "currency", currency: cur }).format(v);

// נקודות צבע בלי inline-style
const colorClass: Record<string, string> = {
  Black: "bg-black",
  White: "bg-white ring-gray-300",
  Beige: "bg-[#f5deb3]",
  Pink: "bg-pink-400",
  Blue: "bg-blue-500",
  Green: "bg-green-500",
  Grey: "bg-gray-400",
  Brown: "bg-amber-800",
};

export default function ProductCard({ product }: Props) {
  const {
    id,
    title,
    price,
    salePrice,
    currency = "ILS",
    category,
    images = [],
    image,
    rating = 5,
    colors = [],
  } = product;

  // הגנה קשיחה על ה-src של התמונה (לא להשאיר מחרוזת ריקה)
  const displayImage =
    (Array.isArray(images) && typeof images[0] === "string" && images[0]) ||
    (typeof image === "string" && image) ||
    "/product-1.png";

  const href = `/category/${(category ?? "").toLowerCase()}/${id}`;
  const hasSale = salePrice != null && Number(salePrice) < Number(price);

  return (
    <article className="group h-full flex flex-col rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <Link href={href} className="relative block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          {hasSale && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow">
              SALE
            </span>
          )}
          <Image
            src={displayImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2 grow">
        {category && (
          <p className="text-xs tracking-widest text-[#7e6d65]">
            {category.toUpperCase()}
          </p>
        )}

        <h3 className="line-clamp-1 text-lg font-medium text-[#1e1b18]">
          <Link href={href}>{title}</Link>
        </h3>

        {/* מחיר עם/בלי מבצע */}
        <div className="flex items-center justify-between">
          {hasSale ? (
            <div className="flex flex-col">
              <span className="text-sm text-[#7e6d65] line-through">
                {fmt(price, currency)}
              </span>
              <span className="text-base font-semibold text-red-600">
                {fmt(salePrice!, currency)}
              </span>
            </div>
          ) : (
            <p className="text-[#4b3a2f]">{fmt(price, currency)}</p>
          )}

          <div className="flex items-center gap-0.5 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={i < Math.round(rating) ? "text-[#c8a18d]" : "text-gray-300"}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {colors.length > 0 && (
          <div className="mt-1 flex items-center gap-2">
            {colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full ring-1 ring-black/10 ${colorClass[c] ?? ""}`}
                title={c}
                aria-label={c}
              />
            ))}
          </div>
        )}

        {/* כאן אנחנו מנווטים לדף המוצר לבחירת מידה/צבע, במקום להוסיף ישר לעגלה */}
        <div className="mt-auto pt-2">
          <Link
            href={href}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#c8a18d] px-6 py-2 font-semibold text-white hover:bg-[#4b3a2f] transition"
            aria-label={`בחרי מידה והוסיפי לעגלה: ${title}`}
            prefetch={false}
          >
            Add to Cart
          </Link>
        </div>
      </div>
    </article>
  );
}
