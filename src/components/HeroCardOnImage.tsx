"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";

export default function HeroCardOnImage() {
  return (
    <section className="relative h-[90vh]">
      {/* תמונת הרקע המקורית */}
      <Image
        src="/hero.jpg"
        alt="Hero background"
        fill
        priority
        className="object-cover"
      />

      {/* ✅ טינט בצבע המותג – כמו שהיה קודם */}
      {/* אפשר לשחק עם /60 /50 /40 כדי לחזק/להחליש את הצבע */}
      <div className="absolute inset-0 bg-[#dbcfc7]/55" />

      {/* שכבת קונטרסט עדינה לטקסט (אפשר להסיר אם לא צריך) */}
      <div className="absolute inset-0 bg-black/5" />

      {/* מלבן לבן גדול עם הכפתורים */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="w-full max-w-5xl bg-white/95 rounded-2xl shadow-xl ring-1 ring-[#e5ddd7] p-8 sm:p-12 text-center">
          <p className="text-xs sm:text-sm tracking-[0.2em] text-[#7e6d65] mb-2">
           The New Collection is live
          </p>

          <h1 className="font-elegant text-[#1e1b18] text-4xl sm:text-6xl leading-[1.1] mb-6">
              HAYAT FASHION
          </h1>

          <p className="text-[#6b5a50] text-base sm:text-lg max-w-3xl mx-auto mb-8">
           
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/category/dresses">
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
