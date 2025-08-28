// src/components/KebabMenu.tsx
"use client";

import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, Fragment, useId } from "react";
import { useRouter } from "next/navigation";
import useCart from "@/hooks/useCart";

type BaseItem = {
  label: string;
  dividerBefore?: boolean;
  danger?: boolean;
  requiresAuth?: boolean;
  disabled?: boolean;
};

type LinkItem = BaseItem & { href: string; onSelect?: never };
type ActionItem = BaseItem & { onSelect: () => void | Promise<void>; href?: never };
export type KebabItem = LinkItem | ActionItem;

type Props = {
  items: KebabItem[];
  className?: string;
  buttonClassName?: string;
  idPrefix?: string; // אופציונלי: אם את רוצה מזהה בעל קידומת קבועה
};

export default function KebabMenu({ items, className = "", buttonClassName = "", idPrefix = "kebab" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const { uid } = useCart();

  // ✅ מזהה דטרמיניסטי שתואם SSR/CSR – פותר את שגיאת ה-hydration
  const rid = useId(); // לדוגמה: ":r0:" – חוקי ב-id
  const menuId = `${idPrefix}-${rid}`; // אפשר להשאיר את הנקודותיים; הן חוקיות

  // סגירה בלחיצה בחוץ/ESC
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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

  const toggle = useCallback(() => setOpen((v) => !v), []);

  // כשנפתח – פוקוס לפריט הראשון
  useEffect(() => {
    if (open) {
      const first = listRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [open]);

  // ניווט חצים בתוך התפריט
  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const itemsEls = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!itemsEls.length) return;

    const idx = itemsEls.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      itemsEls[(idx + 1) % itemsEls.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      itemsEls[(idx - 1 + itemsEls.length) % itemsEls.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      itemsEls[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      itemsEls[itemsEls.length - 1]?.focus();
    }
  };

  async function handleSelect(it: KebabItem) {
    if (it.disabled) return;
    if (it.requiresAuth && !uid) {
      setOpen(false);
      router.push("/login");
      return;
    }
    if ("href" in it && it.href) {
      setOpen(false);
      router.push(it.href);
    } else if ("onSelect" in it && it.onSelect) {
      await it.onSelect();
      setOpen(false);
    }
  }

  // ערך נגישות תקין כמחרוזת
  const ariaExpanded: "true" | "false" = open ? "true" : "false";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={ariaExpanded}
        aria-controls={menuId}
        onClick={toggle}
        type="button"
        className={`inline-flex items-center justify-center rounded-full p-2 text-white/90 hover:text-white hover:bg-white/10 transition ${buttonClassName}`}
      >
        <EllipsisVertical className="w-6 h-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50">
          <ul
            id={menuId}
            ref={listRef}
            role="menu"
            aria-orientation="vertical"
            className="py-1"
            onKeyDown={onListKeyDown}
          >
            {items.map((it, i) => {
              const colorClasses = it.disabled
                ? "text-gray-300 cursor-not-allowed"
                : it.danger
                ? "text-red-600 hover:bg-red-50"
                : "text-[#4b3a2f] hover:bg-[#f1e8e2]";

              return (
                <Fragment key={`${it.label}-${i}`}>
                  {it.dividerBefore && (
                    <li role="separator" className="my-1 h-px bg-gray-100" aria-hidden="true" />
                  )}

                  <li role="none">
                    {"href" in it && it.href ? (
                      <Link
                        href={it.disabled ? "#" : it.href}
                        role="menuitem"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(it);
                        }}
                        className={`block w-full px-4 py-2.5 text-sm transition ${colorClasses}`}
                      >
                        {it.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        tabIndex={0}
                        disabled={it.disabled}
                        onClick={() => handleSelect(it)}
                        className={`block w-full text-left px-4 py-2.5 text-sm transition ${colorClasses}`}
                      >
                        {it.label}
                      </button>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
