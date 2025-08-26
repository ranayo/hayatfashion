"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import Link from "next/link";
import { toast } from "sonner";
import { Product } from "@/types";

const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export default function AdminProductsList() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth.currentUser;
    const email = (u?.email || "").toLowerCase();
    if (!u || !admins.includes(email)) {
      toast.error("אין הרשאה");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
        setItems(list);
      } catch (e) {
        console.error(e);
        toast.error("שגיאה בטעינת מוצרים");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function remove(id: string) {
    if (!confirm("למחוק את המוצר?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setItems(prev => prev.filter(p => p.id !== id));
      toast.success("נמחק");
    } catch (e) {
      console.error(e);
      toast.error("שגיאה במחיקה");
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 py-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#4b3a2f]">מוצרים</h1>
        <Link href="/admin/products/new" className="px-4 py-2 rounded-full bg-[#c8a18d] text-white hover:bg-[#4b3a2f] transition">
          + מוצר חדש
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">טוען...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500">אין מוצרים</div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#3f2f26]">
              <tr>
                <th className="p-3 text-left">תמונה</th>
                <th className="p-3 text-left">שם</th>
                <th className="p-3 text-left">קטגוריה</th>
                <th className="p-3 text-left">מחיר</th>
                <th className="p-3 text-left">מבצע</th>
                <th className="p-3 text-left w-32">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.title} className="w-14 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded" />
                    )}
                  </td>
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">₪{Number(p.price || 0).toFixed(2)}</td>
                  <td className="p-3">{p.salePrice ? `₪${Number(p.salePrice).toFixed(2)}` : "-"}</td>
                  <td className="p-3">
                    {/* לעתיד: קישור עריכה */}
                    {/* <Link href={`/admin/products/${p.id}/edit`} className="underline mr-3">עריכה</Link> */}
                    <button onClick={() => remove(p.id)} className="text-red-600 hover:underline">
                      מחיקה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
