"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

type Props = {
  /** עיצוב: "ghost" בלי רקע / "solid" עם עיגול לבן (ברירת מחדל) */
  variant?: "ghost" | "solid";
  className?: string;
  href?: string; // לאן לנווט כשנלחץ
};

export default function FavoriteButton({
  variant = "solid",
  className = "",
  href = "/favorites",
}: Props) {
  const isGhost = variant === "ghost";

  const wrapper =
    (isGhost
      ? "inline-flex items-center justify-center text-white hover:text-[#dbcfc7]"
      : "inline-flex items-center justify-center rounded-full bg-white/90 text-[#4b3a2f] ring-1 ring-white/60 hover:bg-white"
    ) + " transition " + className;

  return (
    <Link href={href} aria-label="Favorites" className={wrapper}>
      {/* ב-solid מוסיפים מעט ריווח כדי ליצור את העיגול */}
      <Heart className={"w-5 h-5" + (isGhost ? "" : " m-2")} />
    </Link>
  );
}
