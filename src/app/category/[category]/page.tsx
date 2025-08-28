// src/app/category/[category]/page.tsx

import Link from "next/link";
import CategoryClient from "@/components/CategoryClient";

type Params = { category: string };

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  // שומרים את הסגנון שלך עם Promise<Params>
  const { category } = await params;

  const heading =
    category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");

  return (
    <section className="bg-[#f6f2ef]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center justify-center text-sm">
          <Link
            href="/"
            className="font-semibold text-[#4b3a2f] hover:text-[#c8a18d]"
          >
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

        {/* הגריד עם סינון/מיון/עימוד בצד לקוח */}
        <CategoryClient category={category} pageSize={12} />
      </div>
    </section>
  );
}
