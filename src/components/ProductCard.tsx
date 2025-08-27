"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button"; // ← default import

export type Product = {
  id: string;
  title: string;
  price: number;
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

export default function ProductCard({ product }: Props) {
  const {
    id, title, price, currency = "ILS", category,
    images = [], image, rating = 5, colors = [],
  } = product;

  const displayImage = images[0] ?? image ?? "/product-1.png";
  const href = `/category/${(category ?? "").toLowerCase()}/${id}`;

  return (
    <article className="group h-full flex flex-col rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <Link href={href}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
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
          <p className="text-xs tracking-widest text-[#7e6d65]">{category.toUpperCase()}</p>
        )}

        <h3 className="line-clamp-1 text-lg font-medium text-[#1e1b18]">
          <Link href={href}>{title}</Link>
        </h3>

        <div className="flex items-center justify-between">
          <p className="text-[#4b3a2f]">
            {Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(price)}
          </p>
          <div className="flex items-center gap-0.5 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < Math.round(rating) ? "text-[#c8a18d]" : "text-gray-300"}>★</span>
            ))}
          </div>
        </div>

        {colors.length > 0 && (
          <div className="mt-1 flex items-center gap-2">
            {colors.slice(0, 4).map((c, i) => (
              <span key={i} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Button className="w-full rounded-full bg-[#c8a18d] text-white hover:bg-[#4b3a2f]">
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
