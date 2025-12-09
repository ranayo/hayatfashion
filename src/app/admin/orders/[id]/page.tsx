"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

type Order = {
  id: string;
  createdAt?: number;
  email?: string | null;
  phone?: string | null;
  deliveryAddress?: {
    fullName?: string;
    city?: string;
    street?: string;
    notes?: string;
  };
  items?: Array<{
    title?: string;
    quantity?: number;
    price?: number;
    salePrice?: number | null;
  }>;
  subtotal?: number;
  shipping?: number;
  total?: number;
  currency?: string;
  status?: string;
  paymentStatus?: string;
};

const fmtMoney = (v?: number, ccy = "ILS") =>
  typeof v === "number"
    ? new Intl.NumberFormat("he-IL", { style: "currency", currency: ccy }).format(v)
    : "-";

const fmtDate = (ms?: number) =>
  ms ? new Date(ms).toLocaleString("he-IL") : "-";

export default function OrderDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // 🔐 בדיקת הרשאה
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error("יש להתחבר כדי לצפות בהזמנה");
        router.push("/login");
        return;
      }

      const email = (user.email || "").toLowerCase();
      if (admins.includes(email)) {
        setIsAdmin(true);
      } else {
        toast.error("אין הרשאה לצפות בהזמנה זו");
        router.push("/");
      }
    });

    return () => unsub();
  }, [router, admins]);

  // 📦 טעינת הזמנה
  const load = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/orders?single=${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "שגיאה בטעינת הזמנה");
      setOrder(data.order as Order);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [id, isAdmin]);

  // ✏️ עדכון הזמנה
  const patch = async (patchBody: Partial<Order>) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(patchBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "עדכון נכשל");
      toast.success("הזמנה עודכנה בהצלחה");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "עדכון נכשל");
    }
  };

  // ☎️ פעולות ליצירת קשר
  const openWhatsApp = () => {
    if (!order?.phone) return;
    const msg = encodeURIComponent(`שלום ${order.deliveryAddress?.fullName || ""}, ההזמנה #${id}`);
    window.open(`https://wa.me/${order.phone}?text=${msg}`, "_blank");
  };

  const call = () => {
    if (order?.phone) window.open(`tel:${order.phone}`, "_self");
  };

  if (isAdmin === null) return <p className="text-center py-10">בודק הרשאות...</p>;
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#3f2f26]">הזמנה #{id}</h1>
          <Link
            href="/admin/orders"
            className="rounded-full px-3 py-2 bg-white shadow hover:shadow-md transition"
          >
            ← כל ההזמנות
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-6">טוען…</div>
        ) : !order ? (
          <div className="bg-white rounded-2xl shadow p-6">לא נמצאה הזמנה.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6 text-[#3f2f26]">
            {/* פרטי הזמנה */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">תאריך</div>
                <div className="font-medium">{fmtDate(order.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">סכום</div>
                <div className="font-medium">{fmtMoney(order.total, order.currency)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">סטטוס</div>
                <div className="font-medium">{order.status || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">תשלום</div>
                <div className="font-medium">{order.paymentStatus || "-"}</div>
              </div>
            </div>

            {/* פרטי לקוח */}
            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-1">לקוח</div>
              <div className="font-medium">{order.deliveryAddress?.fullName || order.email || "-"}</div>
              <div className="text-gray-700">
                {order.deliveryAddress?.city || "-"} / {order.deliveryAddress?.street || "-"}
              </div>
              <div className="text-gray-700">{order.phone || "-"}</div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={openWhatsApp}
                  className="px-3 py-2 rounded-full border hover:bg-gray-50"
                >
                  וואטסאפ
                </button>
                <button
                  onClick={call}
                  className="px-3 py-2 rounded-full border hover:bg-gray-50"
                >
                  התקשר
                </button>
              </div>
            </div>

            {/* פריטים */}
            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">פריטים</div>
              <ul className="divide-y">
                {order.items?.map((it, i) => (
                  <li key={i} className="py-2 flex justify-between">
                    <span>{it.title} × {it.quantity ?? 1}</span>
                    <span>{fmtMoney((it.salePrice ?? it.price) || 0, order.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* פעולות */}
            <div className="border-t pt-4 grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => patch({ paymentStatus: "paid" })}
                className="rounded-full px-4 py-2 bg-[#4b3a2f] text-white hover:opacity-90"
              >
                סמן כשולם
              </button>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => patch({ status: "awaiting_courier" })}
                  className="rounded-full px-4 py-2 bg-[#c8a18d] text-white hover:bg-[#4b3a2f]"
                >
                  מוכן לשליח
                </button>
                <button
                  onClick={() => patch({ status: "shipped" })}
                  className="rounded-full px-4 py-2 bg-[#c8a18d] text-white hover:bg-[#4b3a2f]"
                >
                  נשלח
                </button>
                <button
                  onClick={() => patch({ status: "cancelled", paymentStatus: "failed" })}
                  className="rounded-full px-4 py-2 border text-red-600 hover:bg-red-50"
                >
                  בטל הזמנה
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}