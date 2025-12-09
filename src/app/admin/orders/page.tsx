"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { toast } from "sonner";

// פורמט כספי
const fmt = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
});

// כל הסטטוסים האפשריים למערכת
const STATUS_OPTIONS = [
  { value: "awaiting_payment", label: "ממתין לתשלום" },
  { value: "paid", label: "שולם" },
  { value: "awaiting_courier", label: "ממתין לשליח" },
  { value: "shipped", label: "נשלח" },
  { value: "pickup_ready", label: "מוכן לאיסוף" },
  { value: "cancelled", label: "בוטל" },
  { value: "refunded", label: "הוחזר" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  // אימות אדמין
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error("יש להתחבר");
        router.push("/login");
        return;
      }

      if (!admins.includes(user.email!.toLowerCase())) {
        toast.error("אין לך הרשאה");
        router.push("/");
        return;
      }

      setIsAdmin(true);
    });
  }, []);

  // טעינת הזמנות
  useEffect(() => {
    if (!isAdmin) return;

    (async () => {
      setLoading(true);
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setOrders(data.items);
      } catch (e) {
        toast.error("שגיאה בטעינת הזמנות");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  // שינוי סטטוס
  async function updateStatus(id: string, newStatus: string) {
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("הסטטוס עודכן בהצלחה");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      toast.error("שגיאה בעדכון הסטטוס");
    }
  }

  if (loading) return <div className="text-center p-10">טוען...</div>;

  return (
    <main className="min-h-screen p-6 bg-[#f6f2ef]">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#4b3a2f]">
        ניהול הזמנות
      </h1>

      <div className="space-y-6 max-w-5xl mx-auto">
        {orders.map((o) => (
          <div key={o.id} className="border p-4 rounded-xl bg-white shadow-lg">

            {/* HEADER */}
            <div className="flex justify-between mb-2 items-center">
              <div>
                <p className="font-semibold text-lg text-[#4b3a2f]">
                  הזמנה #{o.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-600">
                  נוצר ב־ {o.createdAt?.human || "—"}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-[#4b3a2f]">
                  {fmt.format(o.total || o.amount || 0)}
                </p>
                <p className="text-sm text-gray-500">{o.status}</p>
              </div>
            </div>

            {/* CUSTOMER */}
            <div className="text-sm text-gray-700 space-y-1 mb-4">
              <p><b>שם:</b> {o.deliveryAddress?.fullName || "—"}</p>
              <p><b>טלפון:</b> {o.deliveryAddress?.phone || "—"}</p>
              <p>
                <b>עיר:</b> {o.deliveryAddress?.city || "—"} |
                <b> רחוב:</b> {o.deliveryAddress?.street || "—"}
              </p>
              <p><b>תשלום:</b> {o.paymentMethod || o.payment}</p>
            </div>

            {/* ITEMS */}
            <div className="border-t pt-3 space-y-2">
              {o.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex gap-3 p-2 bg-[#faf8f7] rounded-lg border"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={70}
                      height={70}
                      className="rounded-lg object-cover"
                    />
                  )}

                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm">
                      כמות: {item.quantity || item.qty} | מידה: {item.size || "—"}
                    </p>
                    <p className="text-sm">
                      מחיר: {fmt.format(item.price)} | סה״כ:{" "}
                      {fmt.format(item.price * (item.quantity || item.qty || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* STATUS SELECTOR */}
            <div className="mt-4 flex justify-end gap-2">
              <select
  aria-label="Select status"
  value={o.status}
  onChange={(e) => updateStatus(o.id, e.target.value)}
  className="border rounded px-3 py-1 bg-white text-sm"
>

                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {/* quick button */}
              {o.status !== "shipped" && (
                <button
                  onClick={() => updateStatus(o.id, "shipped")}
                  className="text-sm bg-[#c8a18d] text-white px-3 py-1 rounded hover:bg-[#b68f7a]"
                >
                  סמן כנשלחה
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

