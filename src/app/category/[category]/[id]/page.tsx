import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";            // כפתור קיים אצלך (default export)
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

type Params = { category: string; id: string };

type FirestoreProduct = {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;           // "ILS" כברירת מחדל
  images?: string[];
  image?: string;
  colors?: string[] | string;
  sizes?: any[] | Record<string, unknown>;
  rating?: number;             // 0-5
  category?: string;
};

async function getProductById(id: string) {
  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = (snap.data() as FirestoreProduct) ?? {};

  // תמונה/ות
  const images =
    Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : typeof data.image === "string" && data.image
      ? [data.image]
      : ["/product-1.png"];

  // צבעים תמיד מערך
  const colors =
    Array.isArray(data.colors)
      ? data.colors
      : typeof data.colors === "string" && data.colors
      ? [data.colors]
      : [];

  // מידות: תומך גם במערך וגם באובייקט {S:5,M:3}
  let sizes: any[] = [];
  if (Array.isArray(data.sizes)) sizes = data.sizes;
  else if (data.sizes && typeof data.sizes === "object") sizes = Object.keys(data.sizes);

  return {
    id: snap.id,
    title: data.title ?? "Product",
    description: data.description ?? "",
    price: Number(data.price ?? 0),
    currency: data.currency ?? "ILS",
    images,
    colors,
    sizes,
    rating: Number(data.rating ?? 5),
    category: data.category ?? "",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, category } = await params;         // חשוב await ב-App Router
  const product = await getProductById(id);
  if (!product) return <div className="p-10">Product not found.</div>;

  const catLabel = category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");
  const mainImage = product.images?.[0] ?? "/product-1.png";

  return (
    <main className="bg-[#f6f2ef] min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Breadcrumbs + Back to Home */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="text-sm text-[#7e6d65] flex flex-wrap items-center gap-1">
            <Link href="/" className="hover:text-[#4b3a2f]">Home</Link>
            <span>/</span>
            <Link href={`/category/${category}`} className="hover:text-[#4b3a2f]">{catLabel}</Link>
            <span>/</span>
            <span className="text-[#4b3a2f] font-medium line-clamp-1">{product.title}</span>
          </nav>

        
        </div>

        {/* Product section (מעוצב לפי ה-HTML שלך, בצבעים שלנו) */}
        <section className="text-gray-600 body-font overflow-hidden bg-[#f6f2ef]">
          <div className="container mx-auto">
            <div className="lg:w-4/5 mx-auto flex flex-wrap">
              {/* תמונה */}
              <div className="relative lg:w-1/2 w-full lg:h-auto h-64 rounded overflow-hidden bg-white ring-1 ring-black/5">
                <Image src={mainImage} alt={product.title} fill className="object-cover object-center" />
              </div>

              {/* פרטי מוצר */}
              <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                <h2 className="text-xs tracking-widest text-[#7e6d65]">
                  {(product.category || catLabel).toUpperCase()}
                </h2>
                <h1 className="text-3xl font-medium text-[#4b3a2f] mb-1">
                  {product.title}
                </h1>

                {/* דירוג */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.round(product.rating ?? 5) ? "text-[#c8a18d]" : "text-gray-300"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-[#7e6d65] ml-3">
                    {(product.rating ?? 5).toFixed(1)} / 5
                  </span>
                </div>

                {/* תיאור */}
                <p className="leading-relaxed text-[#6b5a50]">
                  {product.description || "No description available."}
                </p>

                {/* צבעים + מידות */}
                <div className="flex mt-6 items-center pb-5 border-b-2 border-[#e5ddd7] mb-5">
                  <div className="flex items-center">
                    <span className="mr-3 text-[#4b3a2f]">Color</span>
                    {product.colors?.length ? (
                      product.colors.slice(0, 6).map((c, i) => (
                        <span
                          key={i}
                          className="border-2 border-gray-300 ml-1 rounded-full w-6 h-6 inline-block ring-1 ring-black/5"
                          style={{ backgroundColor: String(c) }}
                          title={String(c)}
                        />
                      ))
                    ) : (
                      <span className="text-sm text-[#7e6d65]">—</span>
                    )}
                  </div>

                  {product.sizes?.length > 0 && (
                    <div className="flex ml-6 items-center">
                      <span className="mr-3 text-[#4b3a2f]">Size</span>
                      <div className="relative">
                        <select className="rounded border appearance-none border-[#e5ddd7] py-2 pl-3 pr-10 bg-white text-[#4b3a2f] focus:outline-none focus:ring-2 focus:ring-[#c8a18d]/40 focus:border-[#c8a18d]">
                          {product.sizes.map((s: any, idx: number) => (
                            <option key={idx}>{typeof s === "string" ? s : s?.name ?? String(s)}</option>
                          ))}
                        </select>
                        <span className="absolute right-0 top-0 h-full w-10 text-center text-[#7e6d65] pointer-events-none flex items-center justify-center">
                          ▾
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* מחיר + כפתורים */}
                <div className="flex items-center">
                  <span className="title-font font-medium text-2xl text-[#4b3a2f]">
                    {Intl.NumberFormat("en", {
                      style: "currency",
                      currency: product.currency ?? "ILS",
                      maximumFractionDigits: 2,
                    }).format(product.price ?? 0)}
                  </span>

                  <Button className="flex ml-auto rounded-full bg-[#c8a18d] px-6 py-3 text-white hover:bg-[#4b3a2f]">
                    Add to Cart
                  </Button>

                  <button
                    className="rounded-full w-10 h-10 bg-white p-0 border-0 inline-flex items-center justify-center text-[#7e6d65] ml-4 ring-1 ring-[#e5ddd7] hover:bg-[#f1e8e2] transition"
                    aria-label="Add to wishlist"
                    title="Add to wishlist"
                  >
                    ♥
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
