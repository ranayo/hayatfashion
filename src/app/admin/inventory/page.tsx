"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  // ✉️ רשימת אדמינים מתוך ENV
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // 🔐 בדיקת הרשאות
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error("⛔ יש להתחבר למערכת");
        router.push("/login");
        return;
      }
      const email = (user.email || "").toLowerCase();
      if (admins.includes(email)) {
        setIsAdmin(true);
      } else {
        toast.error("🚫 אין לך הרשאה לדף זה");
        setIsAdmin(false);
        router.push("/");
      }
    });

    return () => unsub();
  }, [router, admins]);

  // 📦 טעינת מוצרים
  useEffect(() => {
    if (!isAdmin) return;
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(list);
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("שגיאה בטעינת מוצרים");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isAdmin]);

  // 🧮 שינוי מלאי מקומי
  const handleChange = (productId: string, sizeIndex: number, value: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              sizes: Array.isArray(p.sizes)
                ? p.sizes.map((s: any, i: number) =>
                    i === sizeIndex ? { ...s, stock: Number(value) } : s
                  )
                : [],
            }
          : p
      )
    );
  };

  // 💾 שמירת מלאי
  const saveStock = async (productId: string, sizes: any[]) => {
    try {
      setSaving(productId);
      const ref = doc(db, "products", productId);
      const inStock = Array.isArray(sizes) && sizes.some((s) => s.stock > 0);
      await updateDoc(ref, { sizes, inStock, soldOut: !inStock });
      toast.success("✅ המלאי עודכן בהצלחה!");
    } catch (err) {
      console.error(err);
      toast.error("❌ עדכון המלאי נכשל");
    } finally {
      setSaving(null);
    }
  };

  // 🔎 סינון מוצרים
  const filteredProducts = products.filter((p) => {
    const hasStock = Array.isArray(p.sizes) && p.sizes.some((s: any) => s.stock > 0);
    if (filter === "in") return hasStock;
    if (filter === "out") return !hasStock;
    return true;
  });

  if (isAdmin === null) return <p className="text-center py-10">בודק הרשאות...</p>;
  if (!isAdmin) return null;
  if (loading) return <p className="text-center py-10">טוען מוצרים...</p>;

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 py-10">
      <h1 className="text-3xl font-semibold text-center text-[#4b3a2f] mb-8">
        ניהול מלאי
      </h1>

      {/* 🔍 סינון */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full ${
            filter === "all"
              ? "bg-[#4b3a2f] text-white"
              : "bg-[#eae3de] text-[#4b3a2f]"
          }`}
        >
          כל המוצרים
        </button>
        <button
          onClick={() => setFilter("in")}
          className={`px-4 py-2 rounded-full ${
            filter === "in"
              ? "bg-green-700 text-white"
              : "bg-green-100 text-green-700"
          }`}
        >
          במלאי
        </button>
        <button
          onClick={() => setFilter("out")}
          className={`px-4 py-2 rounded-full ${
            filter === "out"
              ? "bg-red-700 text-white"
              : "bg-red-100 text-red-700"
          }`}
        >
          אזלו מהמלאי
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow rounded-2xl p-6 space-y-8">
        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500">
            לא נמצאו מוצרים התואמים לסינון הנבחר.
          </p>
        )}

        {filteredProducts.map((p) => {
          const inStock =
            Array.isArray(p.sizes) && p.sizes.some((s: any) => s.stock > 0);

          return (
            <div key={p.id} className="border-b pb-6">
              <div className="flex items-center gap-4 mb-3">
                {p.images?.[0] && (
                  <Image
                    src={p.images[0]}
                    alt={p.title || "Product"}
                    width={90}
                    height={90}
                    className="rounded-xl object-cover border"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-[#4b3a2f] flex items-center gap-2">
                    {p.title || "Unnamed Product"}
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {inStock ? "במלאי" : "אזל מהמלאי"}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">
                    קטגוריה: {p.category || "—"}
                  </p>
                </div>
              </div>

              {Array.isArray(p.sizes) && p.sizes.length > 0 ? (
                <table className="w-full border text-[#4b3a2f] rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#f9f7f4]">
                      <th className="py-2">מידה</th>
                      <th>מלאי</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.sizes.map((s: any, i: number) => (
                      <tr key={i} className="text-center">
                        <td className="py-2 font-medium">{s.size}</td>
                        <td>
                          <input
                            type="number"
                            className="border rounded-lg p-1 w-20 text-center"
                            value={s.stock}
                            aria-label={`מלאי למידה ${s.size}`}
                            title={`מלאי למידה ${s.size}`}
                            onChange={(e) =>
                              handleChange(p.id, i, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm italic text-gray-500">
                  אין מידות זמינות למוצר זה
                </p>
              )}

              <button
                onClick={() =>
                  saveStock(p.id, Array.isArray(p.sizes) ? p.sizes : [])
                }
                disabled={saving === p.id}
                className="mt-4 bg-[#c8a18d] text-white px-5 py-2 rounded-full hover:bg-[#4b3a2f] transition disabled:opacity-50"
              >
                {saving === p.id ? "שומר..." : "שמור שינויים"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
