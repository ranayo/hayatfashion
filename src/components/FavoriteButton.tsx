// src/components/FavoriteButton.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

type Props = {
  /** "ghost" = אייקון בלי רקע, "solid" = עיגול לבן (ברירת מחדל) */
  variant?: "ghost" | "solid";
  className?: string;

  /** מזהה המוצר (ישמש כשם המסמך ב־favorites) */
  productId: string;

  /** נתוני מוצר לשמירה במסמך המועדפים */
  title: string;
  price: number;
  salePrice?: number;
  currency?: string;
  image?: string;
  category?: string;

  /** להפנות לדף התחברות אם לא מחוברים (ברירת מחדל true) */
  redirectIfAnon?: boolean;
};

export default function FavoriteButton({
  variant = "solid",
  className = "",
  productId,
  title,
  price,
  salePrice,
  currency = "ILS",
  image = "/product-1.png",
  category = "",
  redirectIfAnon = true,
}: Props) {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [isFav, setIsFav] = useState(false);
  const [busy, setBusy] = useState(false);

  // עוקבים אחרי סטטוס התחברות
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUid(u?.uid ?? null);
      if (u) {
        const ref = doc(db, "users", u.uid, "favorites", productId);
        const snap = await getDoc(ref);
        setIsFav(snap.exists());
      } else {
        setIsFav(false);
      }
    });
    return () => unsub();
  }, [productId]);

  async function toggleFav() {
    if (!uid) {
      if (redirectIfAnon) router.push("/login");
      return;
    }
    try {
      setBusy(true);
      const ref = doc(db, "users", uid, "favorites", productId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        setIsFav(false);
      } else {
        await setDoc(ref, {
          productId,
          title,
          price: Number(price) ?? 0,
          salePrice: salePrice ?? null,
          currency,
          image,
          category,
          createdAt: serverTimestamp(),
        });
        setIsFav(true);
      }
    } finally {
      setBusy(false);
    }
  }

  const wrapperBase =
    variant === "ghost"
      ? "inline-flex items-center justify-center text-white hover:text-[#dbcfc7]"
      : "inline-flex items-center justify-center rounded-full bg-white/90 text-[#4b3a2f] ring-1 ring-white/60 hover:bg-white";

  const wrapper = `${wrapperBase} transition ${className}`;

  return (
    <button
      type="button"
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFav}
      disabled={busy}
      onClick={toggleFav}
      className={wrapper}
    >
      {/* ב-solid מוסיפים מעט ריווח כדי ליצור את העיגול */}
      <Heart
        className={`w-5 h-5 ${variant === "solid" ? "m-2" : ""} ${
          isFav ? "text-rose-600" : ""
        }`}
        // ממלא את האייקון כשהמוצר במועדפים
        fill={isFav ? "currentColor" : "none"}
      />
    </button>
  );
}
