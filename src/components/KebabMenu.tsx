"use client";

import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Item = { label: string; href: string };
type Props = {
  items: Item[];
  className?: string;        // לעטיפה החיצונית (position)
  buttonClassName?: string;  // לכפתור עצמו
};

export default function KebabMenu({ items, className = "", buttonClassName = "" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // סגירה בלחיצה בחוץ/ESC
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center justify-center rounded-full p-2 text-white/90 hover:text-white hover:bg-white/10 transition ${buttonClassName}`}
      >
        <EllipsisVertical className="w-6 h-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50"
        >
          <ul className="py-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-[#4b3a2f] hover:bg-[#f1e8e2] hover:text-[#4b3a2f] transition"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
