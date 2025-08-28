"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import { MouseEvent } from "react";

export default function HeroCardOnImage() {
  // גלילה חלקה לעוגן #categories אם הוא נמצא בדף
  const handleShopNow = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById("categories");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // אם אין #categories בדף הנוכחי, ה־Link ימשיך כרגיל (למקרה שתשימי את ההרוא בחצים אחרים)
  };

  return (
    <section className="relative h-[75vh] md:h-[90vh]">
      {/* תמונת רקע */}
      <Image
        src="/hero.jpg"
        alt="Hero background"
        fill
        priority
        className="object-cover"
      />

      {/* טינט עדין בצבע המותג */}
      <div className="absolute inset-0 bg-[#dbcfc7]/55" />
      {/* שכבת קונטרסט עדינה */}
      <div className="absolute inset-0 bg-black/5" />

      {/* כרטיס לבן מעל התמונה */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="w-full max-w-5xl bg-white/95 rounded-2xl shadow-xl ring-1 ring-[#e5ddd7] p-6 sm:p-10 text-center">
          <p className="text-xs sm:text-sm tracking-[0.2em] text-[#7e6d65] mb-2">
            The New Collection is live
          </p>

          <h1 className="font-elegant text-[#1e1b18] text-4xl sm:text-6xl leading-[1.1] mb-6">
            HAYAT FASHION
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* גולל לקטגוריות בדף הנוכחי */}
            <Link href="#categories" onClick={handleShopNow} aria-label="Shop now">
              <Button className="rounded-full bg-[#c8a18d] hover:bg-[#4b3a2f] text-white px-6 py-3">
                SHOP NOW
              </Button>
            </Link>

            <Link
              href="/about"
              className="rounded-full px-6 py-3 text-sm font-semibold text-[#4b3a2f] ring-1 ring-[#e5ddd7] hover:bg-[#f1e8e2] transition"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
