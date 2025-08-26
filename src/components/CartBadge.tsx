"use client";

import Link from "next/link";
import useCart from "@/hooks/useCart";

export default function CartBadge() {
  const { ready, items, total, user } = useCart();

  // סופרים את סה״כ הכמויות
  const totalQty = items.reduce((s, it) => s + (it?.data?.qty || 0), 0);

  // פורמט נחמד למחיר
  const totalStr = new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(total || 0);

  // מצב טעינה קצר/לא מחובר
  const disabled = !ready || !user;

  return (
    <Link
      href="/cart"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border transition ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-[#c8a18d] hover:text-white"
      }`}
      title={disabled ? "התחברי כדי לראות עגלה" : "לצפייה בעגלה"}
      aria-disabled={disabled}
      onClick={(e) => { if (disabled) e.preventDefault(); }}
    >
      {/* אייקון עגלה מינימלי ב-Tailwind (ללא SVG חיצוני) */}
      <span
        aria-hidden
        className="relative w-5 h-5 before:content-[''] before:absolute before:w-4 before:h-2 before:rounded-t before:border before:left-0.5 before:top-0.5 after:content-[''] after:absolute after:w-1.5 after:h-1.5 after:rounded-full after:border after:left-[2px] after:bottom-0"
      />
      <span className="text-[#4b3a2f] font-medium">
        {totalQty} פריטים
      </span>
      <span className="h-4 w-px bg-gray-300" />
      <span className="text-[#4b3a2f] font-semibold">{totalStr}</span>
    </Link>
  );
}
