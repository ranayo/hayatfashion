// src/components/NewArrivalsGrid.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type GridProduct = {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image: string;
  currency?: string;
  category?: string;
  href?: string;
};

export default function ProductGrid({ items }: { items: GridProduct[] }) {
  return (
    <>
      {/* במובייל – קרוסלה חלקה; בדסקטופ – גריד אלגנטי */}
      <div className="md:hidden -mx-6 px-6 overflow-x-auto scrollbar-none">
        <div className="flex snap-x snap-mandatory gap-4 pr-6">
          {items.map((p) => (
            <div key={p.id} className="min-w-[72%] snap-start">
              <Card p={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-3 xl:grid-cols-6 gap-6">
        {items.map((p) => (
          <Card key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}

function Card({ p }: { p: GridProduct }) {
  const currency = p.currency ?? "EUR";
  const price = p.salePrice ?? p.price;
  const fallbackHref = `/category/${encodeURIComponent(
    p.category ?? "misc"
  )}/${encodeURIComponent(p.id)}`;

  return (
    <div className="
      group relative overflow-hidden rounded-[22px]
      bg-white border border-[#eadfd8]
      shadow-[0_6px_30px_rgba(75,58,47,0.06)]
      transition hover:-translate-y-1.5 hover:shadow-[0_14px_40px_rgba(75,58,47,0.12)]
    ">
      {/* תמונה */}
      <div className="relative aspect-[4/5] bg-zinc-100">
        <Image
          src={p.image}
          alt={p.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 72vw, (max-width: 1280px) 20vw, 16vw"
        />

        {/* תג NEW מעוגל עם גרדיאנט עדין */}
        <span className="
          absolute left-3 top-3 rounded-full px-2.5 py-[3px]
          text-[11px] font-medium text-white shadow-sm
          bg-gradient-to-br from-[#c8a18d] to-[#b88e79]/90
        ">
          NEW
        </span>

        {/* היילייט עדין בהובר */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        <Link href={p.href ?? fallbackHref} className="absolute inset-0" aria-label={p.title} />
      </div>

      {/* פרטים */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-[#2a211c] line-clamp-1">
          {p.title}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          {p.salePrice ? (
            <>
              <span className="text-sm font-semibold text-[#4b3a2f]">
                {fmt(price, currency)}
              </span>
              <span className="text-xs text-zinc-400 line-through">
                {fmt(p.price, currency)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-[#4b3a2f]">
              {fmt(price, currency)}
            </span>
          )}
        </div>

        {/* כפתור View בסגנון בהיר */}
        <Link
          href={p.href ?? fallbackHref}
          className="
            mt-3 inline-flex w-full items-center justify-center
            rounded-xl border border-[#e7ddd6] bg-white
            px-3 py-2 text-sm text-[#4b3a2f]
            hover:bg-[#f4ece6] transition
          "
        >
          View
        </Link>
      </div>

      {/* הילה רכה בקצה הכרטיס */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#f6f2ef] to-transparent" />
    </div>
  );
}

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
