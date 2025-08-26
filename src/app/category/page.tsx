// src/app/category/page.tsx
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/data/categories";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 py-10">
      <h1 className="text-4xl font-semibold text-center mb-10">Categories</h1>

      <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 place-items-center">
        {CATEGORIES.map((cat) => {
          const slug = cat.slug.toLowerCase(); // תאימות ל-Firestore
          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              prefetch={false}
              className="group flex flex-col items-center"
              aria-label={cat.title}
            >
              <span className="relative w-28 h-28 md:w-32 md:h-32 rounded-full ring-1 ring-gray-200 shadow bg-white overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 7rem, 8rem"
                  className="object-cover group-hover:scale-105 transition"
                  priority={false}
                />
              </span>
              <span className="mt-3 text-sm text-[#3f2f26]">{cat.title}</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
