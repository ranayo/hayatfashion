// src/app/category/[category]/page.tsx

import ProductCard from "@/components/ProductCard";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

type Params = { category: string };
type SearchParams = { page?: string };

const PAGE_SIZE = 12;

/** בוחר את התמונה הראשונה התקינה ממערך/שדה image (או ברירת־מחדל) */
function pickImage(images?: any[], image?: any): string {
  const list = Array.isArray(images) ? images : [];
  const candidates = [...list, image];

  for (const cand of candidates) {
    if (typeof cand === "string" && cand.trim()) return cand;
    if (cand && typeof cand === "object") {
      const maybe = (cand as any).url ?? (cand as any).src ?? "";
      if (typeof maybe === "string" && maybe.trim()) return maybe;
    }
  }
  return "/product-1.png";
}

async function getProductsByCategory(category: string) {
  const q = query(collection(db, "products"), where("category", "==", category));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data: any = docSnap.data();
    const images: any[] = Array.isArray(data.images) ? data.images : [];

    return {
      id: docSnap.id,
      title: data.title ?? "Product",
      price: Number(data.price ?? 0),
      salePrice:
        data.salePrice == null || data.salePrice === ""
          ? undefined
          : Number(data.salePrice),

      // שולחים גם image מנורמל וגם את המערך למקרה שתרצי בעתיד קרוסלה
      image: pickImage(images, data.image),
      images,

      category: data.category ?? category,
      rating: Number(data.rating ?? 5),
      currency: data.currency ?? "ILS",
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? null,
    };
  });
}

// יוצר מערך עמודים עם … כשצריך
function getPageNumbers(totalPages: number, current: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await params; // אם כך בנוי הפרויקט שלך — נשאיר עם await
  const { page: pageParam } = await searchParams;

  const all = await getProductsByCategory(category);
  const total = all.length;

  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const items = all.slice(start, end);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const heading = category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");

  return (
    <section className="bg-[#f6f2ef]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Breadcrumbs: HOME \ CATEGORY */}
        <nav className="mb-4 flex items-center justify-center text-sm">
          <Link href="/" className="font-semibold text-[#4b3a2f] hover:text-[#c8a18d]">
            HOME
          </Link>
          <span className="mx-2 text-[#c8a18d]">\</span>
          <span className="font-semibold text-[#4b3a2f]">
            {heading.toUpperCase()}
          </span>
        </nav>

        <h1 className="mb-8 text-center text-3xl font-semibold text-[#4b3a2f]">
          {heading}
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-between border-t border-[#e5ddd7] px-4 py-3 sm:px-6">
          {/* מובייל */}
          <div className="flex flex-1 justify-between sm:hidden">
            <a
              href={hasPrev ? `?page=${page - 1}` : "#"}
              aria-disabled={!hasPrev}
              className={`relative inline-flex items-center rounded-md border border-[#e5ddd7] bg-white px-4 py-2 text-sm font-medium ${
                hasPrev ? "text-[#4b3a2f] hover:bg-[#f1e8e2]" : "text-gray-400 pointer-events-none"
              }`}
            >
              Previous
            </a>
            <a
              href={hasNext ? `?page=${page + 1}` : "#"}
              aria-disabled={!hasNext}
              className={`relative ml-3 inline-flex items-center rounded-md border border-[#e5ddd7] bg-white px-4 py-2 text-sm font-medium ${
                hasNext ? "text-[#4b3a2f] hover:bg-[#f1e8e2]" : "text-gray-400 pointer-events-none"
              }`}
            >
              Next
            </a>
          </div>

          {/* דסקטופ */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#6b5a50]">
                Showing{" "}
                <span className="font-medium">{total === 0 ? 0 : start + 1}</span>{" "}
                to <span className="font-medium">{end}</span> of{" "}
                <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md">
                {/* Prev */}
                <a
                  href={hasPrev ? `?page=${page - 1}` : "#"}
                  aria-disabled={!hasPrev}
                  className={`relative inline-flex items-center rounded-l-md px-3 py-2 ring-1 ring-[#e5ddd7] ${
                    hasPrev ? "text-[#4b3a2f] hover:bg-[#f1e8e2]" : "text-gray-400 pointer-events-none"
                  }`}
                >
                  <span className="sr-only">Previous</span> ‹
                </a>

                {/* Pages */}
                {getPageNumbers(totalPages, page).map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 ring-1 ring-[#e5ddd7]"
                    >
                      …
                    </span>
                  ) : p === page ? (
                    <span
                      key={p}
                      aria-current="page"
                      className="relative z-10 inline-flex items-center bg-[#c8a18d] px-4 py-2 text-sm font-semibold text-white"
                    >
                      {p}
                    </span>
                  ) : (
                    <a
                      key={p}
                      href={`?page=${p}`}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#4b3a2f] ring-1 ring-[#e5ddd7] hover:bg-[#f1e8e2]"
                    >
                      {p}
                    </a>
                  )
                )}

                {/* Next */}
                <a
                  href={hasNext ? `?page=${page + 1}` : "#"}
                  aria-disabled={!hasNext}
                  className={`relative inline-flex items-center rounded-r-md px-3 py-2 ring-1 ring-[#e5ddd7] ${
                    hasNext ? "text-[#4b3a2f] hover:bg-[#f1e8e2]" : "text-gray-400 pointer-events-none"
                  }`}
                >
                  <span className="sr-only">Next</span> ›
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
