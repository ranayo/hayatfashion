// src/app/category/[category]/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import AddToCartClient from "@/components/AddToCartClient";
import FavoriteButton from "@/components/FavoriteButton";

type Params = { category: string; id: string };

type FirestoreProduct = {
  title?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  currency?: string;
  images?: unknown[];
  image?: unknown;
  colors?: string[] | string;
  // באדמין זה יכול להיות: מערך, אובייקט {S:10}, או מחרוזת "S:10, M:5" / "S,M"
  sizes?: unknown;
  sizesStock?: unknown; // לכיסוי שם חלופי אם השתמשת בו
  rating?: number;
  category?: string;
};

/* ---------- Helpers ---------- */

// בוחרת תמונה ראשית תקינה
function pickImage(images?: unknown[], image?: unknown): string {
  const list = Array.isArray(images) ? images : [];
  const candidates = [...list, image];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
    if (c && typeof c === "object") {
      const maybe = (c as any).url ?? (c as any).src ?? "";
      if (typeof maybe === "string" && maybe.trim()) return maybe;
    }
  }
  return "/product-1.png";
}

// נרמול תווית מידה
const CANON = (s: string) =>
  s.replace(/\s+/g, "").toUpperCase().replace("X-S", "XS").replace("X-L", "XL");

// מחזיר מערך מידות זמינות + מיפוי מלאי לפי מידה
function parseSizes(data: any): { sizes: string[]; stock: Record<string, number> } {
  const out: string[] = [];
  const stock: Record<string, number> = {};

  const raw = data?.sizes ?? data?.sizesStock ?? data?.sizeStock ?? null;

  if (!raw) return { sizes: out, stock };

  // 1) מערך פשוט: ["S","M"] או [{name:"S",qty:5}]
  if (Array.isArray(raw)) {
    for (const it of raw) {
      if (typeof it === "string") {
        const k = CANON(it);
        if (k) {
          out.push(k);
          stock[k] = Math.max(1, stock[k] ?? 1);
        }
      } else if (it && typeof it === "object") {
        const name = CANON((it as any).name ?? (it as any).size ?? "");
        const qty = Number((it as any).qty ?? (it as any).stock ?? 1);
        if (name) {
          if (!Number.isNaN(qty)) stock[name] = qty;
          if ((stock[name] ?? qty) > 0) out.push(name);
        }
      }
    }
    return { sizes: Array.from(new Set(out)), stock };
  }

  // 2) אובייקט: { S:10, M:0 }
  if (raw && typeof raw === "object") {
    for (const k of Object.keys(raw)) {
      const key = CANON(k);
      const qty = Number((raw as any)[k] ?? 0);
      if (!Number.isNaN(qty)) stock[key] = qty;
      if (qty > 0) out.push(key);
    }
    return { sizes: out, stock };
  }

  // 3) מחרוזת: "S:10, M:5, L:0" או "S, M"
  if (typeof raw === "string") {
    const parts = raw.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
    for (const p of parts) {
      if (p.includes(":") || p.includes("=")) {
        const [left, right] = p.split(/[:=]/);
        const key = CANON(left || "");
        const qty = Number((right || "").trim());
        if (key) {
          if (!Number.isNaN(qty)) stock[key] = qty;
          if (qty > 0) out.push(key);
        }
      } else {
        const key = CANON(p);
        if (key) {
          out.push(key);
          stock[key] = Math.max(1, stock[key] ?? 1);
        }
      }
    }
    return { sizes: Array.from(new Set(out)), stock };
  }

  return { sizes: out, stock };
}

async function getProductById(id: string) {
  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = (snap.data() as FirestoreProduct) ?? {};

  const images = Array.isArray(data.images) ? data.images : [];
  const mainImage = pickImage(images, data.image);

  // צבעים תמיד מערך
  const colors =
    Array.isArray(data.colors)
      ? data.colors
      : typeof data.colors === "string" && data.colors
      ? [data.colors]
      : [];

  // מידות ומלאי — הפרסר החדש
  const { sizes, stock } = parseSizes(data);

  return {
    id: snap.id,
    title: data.title ?? "Product",
    description: data.description ?? "",
    price: Number(data.price ?? 0),
    salePrice: data.salePrice != null ? Number(data.salePrice) : undefined,
    currency: data.currency ?? "ILS",
    images: images as string[],
    image: mainImage,
    colors,
    sizes,           // לדוגמה ["M"] אם באדמין הזנת רק M>0
    sizesStock: stock,
    rating: Number(data.rating ?? 5),
    category: data.category ?? "",
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id, category } = params;
  const product = await getProductById(id);
  if (!product) return <div className="p-10">Product not found.</div>;

  const catLabel =
    category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");
  const fmt = new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: product.currency ?? "ILS",
    maximumFractionDigits: 2,
  });

  const hasSale =
    product.salePrice != null && Number(product.salePrice) < Number(product.price);

  const catForFav = (product.category || category).toLowerCase();

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

        {/* Product section */}
        <section className="text-gray-600 body-font overflow-hidden bg-[#f6f2ef]">
          <div className="container mx-auto">
            <div className="lg:w-4/5 mx-auto flex flex-wrap">
              {/* תמונה + SALE + לב מועדפים */}
              <div className="relative lg:w-1/2 w-full lg:h-auto h-64 rounded overflow-hidden bg-white ring-1 ring-black/5">
                {hasSale && (
                  <span className="absolute left-2 top-2 z-20 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow">
                    SALE
                  </span>
                )}

                {/* לב מועדפים (מימין־עליון מעל התמונה) */}
                <div className="absolute right-2 top-2 z-20">
                  <FavoriteButton
                    variant="solid"
                    className="shadow-sm"
                    productId={product.id}
                    title={product.title}
                    price={product.price}
                    salePrice={product.salePrice}
                    currency={product.currency}
                    image={product.image}
                    category={catForFav}
                  />
                </div>

                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* פרטים */}
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
                      <span key={i} className={i < Math.round(product.rating ?? 5) ? "text-[#c8a18d]" : "text-gray-300"}>★</span>
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

                {/* מחיר */}
                <div className="mt-6 border-b-2 border-[#e5ddd7] pb-5 mb-5">
                  {hasSale ? (
                    <div className="flex flex-col">
                      <span className="text-[#7e6d65] line-through">
                        {fmt.format(product.price)}
                      </span>
                      <span className="text-red-600 text-2xl font-semibold">
                        {fmt.format(product.salePrice!)}
                      </span>
                    </div>
                  ) : (
                    <span className="title-font font-medium text-2xl text-[#4b3a2f]">
                      {fmt.format(product.price)}
                    </span>
                  )}
                </div>

                {/* בחירת צבע/מידה + Add to Cart (כולל חובת בחירה) */}
                <AddToCartClient product={product as any} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
