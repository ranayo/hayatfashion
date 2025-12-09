"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import useCart from "@/hooks/useCart";
import { toast } from "sonner";

const fmt = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" });
const FLAT_SHIPPING = 20;

export default function CheckoutPage() {
  const router = useRouter();
  const { uid, items, clearCart } = useCart();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    city: "",
    street: "",
    notes: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<null | "cod">(null);

  const canSubmit =
    items.length > 0 && address.fullName && address.phone && address.city && address.street;

  const subtotal = items.reduce((sum, it) => sum + it.price * (it.qty || 1), 0);
  const total = subtotal + FLAT_SHIPPING;

  /** 🔍 בדיקת מלאי */
  const verifyCartBeforePayment = async () => {
    for (const it of items) {
      const productRef = doc(db, "products", it.productId);
      const snap = await getDoc(productRef);

      if (!snap.exists()) throw new Error(`המוצר "${it.title}" כבר לא קיים.`);

      const data = snap.data();
      const realPrice = data.salePrice ?? data.price;

      let stock = 0;

      if (Array.isArray(data.sizes)) {
        const match = data.sizes.find((s: any) => s.size === it.size);
        stock = match?.stock ?? 0;
      } else if (data.stockBySize) {
        stock = data.stockBySize[it.size ?? ""] ?? 0;
      } else {
        stock = data.totalStock ?? 0;
      }

      if (realPrice !== it.price)
        throw new Error(`המוצר "${it.title}" עודכן במחיר, אנא רענני את הדף.`);
      if (stock <= 0)
        throw new Error(`המוצר "${it.title}" אזל מהמלאי.`);
      if (it.qty > stock)
        throw new Error(`אין מספיק במלאי למוצר "${it.title}".`);
    }
    return true;
  };

  /** 💵 תשלום לשליח */
  const payCOD = async () => {
    if (!canSubmit) return toast.error("מלאי את כל הפרטים לפני ביצוע ההזמנה.");
    if (!uid) return toast.error("התחברי כדי להשלים הזמנה.");

    try {
      setLoading("cod");
      await verifyCartBeforePayment();

      localStorage.setItem("hayat_checkout", JSON.stringify({
        fullName: address.fullName,
        phone: address.phone,
        city: address.city,
        street: address.street,
        notes: address.notes,
        deliveryMethod: "courier",
        subtotal,
        shipping: FLAT_SHIPPING,
        total,
      }));

      const orderData = {
        userId: uid,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          qty: i.qty,
          price: i.price,
          image: i.image ?? null,
          size: i.size ?? null,
          color: i.color ?? null,
        })),
        deliveryAddress: { ...address },
        email: email || null,
        phone: address.phone,
        amount: total,
        status: "awaiting_delivery",
        payment: "COD",
        createdAt: serverTimestamp(),
      };

      const mainOrderRef = await addDoc(collection(db, "orders"), orderData);

      await addDoc(collection(db, "users", uid, "orders"), {
        ...orderData,
        orderId: mainOrderRef.id,
      });

      if (email) {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            orderId: mainOrderRef.id,
            items,
            total,
            address,
          }),
        });
      }

      toast.success("💌 ההזמנה נשלחה! שלחנו לך אישור במייל.");
      clearCart?.();
      router.push(`/thank-you?order=${mainOrderRef.id}&cod=1`);

    } catch (e: any) {
      toast.error(e.message || "שגיאה ביצירת ההזמנה.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 md:px-6 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8 text-[#4b3a2f]">
        סיום הזמנה
      </h1>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 gap-8">
        
        {/* פרטי משלוח */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#4b3a2f]">פרטי משלוח</h2>
          <div className="space-y-3">
            {["fullName", "phone", "city", "street"].map((field) => (
              <input
                key={field}
                className="w-full border rounded-xl p-3 text-[#4b3a2f]"
                placeholder={
                  field === "fullName"
                    ? "שם מלא"
                    : field === "phone"
                    ? "טלפון"
                    : field === "city"
                    ? "עיר"
                    : "רחוב"
                }
                value={address[field as keyof typeof address]}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, [field]: e.target.value }))
                }
              />
            ))}

            <input
              className="w-full border rounded-xl p-3 text-[#4b3a2f]"
              placeholder="אימייל (לא חובה)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <textarea
              className="w-full border rounded-xl p-3 text-[#4b3a2f]"
              placeholder="הערות למשלוח"
              value={address.notes}
              onChange={(e) =>
                setAddress((a) => ({ ...a, notes: e.target.value }))
              }
            />
          </div>
        </div>

        {/* סיכום הזמנה */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#4b3a2f]">
            סיכום הזמנה
          </h2>

          {items.length === 0 ? (
            <p className="text-[#4b3a2f]">העגלה שלך ריקה.</p>
          ) : (
            <>
              <ul className="divide-y text-[#4b3a2f]">
                {items.map((it) => (
                  <li key={it.id} className="py-2 flex justify-between">
                    <span>{it.title} × {it.qty}</span>
                    <span>{fmt.format(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-between text-[#4b3a2f]">
                <span>סה״כ מוצרים</span>
                <span>{fmt.format(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#4b3a2f]">
                <span>משלוח</span>
                <span>{fmt.format(FLAT_SHIPPING)}</span>
              </div>

              <div className="mt-2 flex justify-between text-lg font-semibold text-[#4b3a2f]">
                <span>לתשלום</span>
                <span>{fmt.format(total)}</span>
              </div>

              {/* ❌ הסרנו את תשלום אונליין */}
              <div className="mt-6 grid gap-3">
                <button
                  onClick={payCOD}
                  disabled={!canSubmit || loading === "cod"}
                  className="w-full rounded-full px-6 py-3 bg-[#c8a18d] text-white hover:bg-[#4b3a2f] transition disabled:opacity-50"
                >
                  {loading === "cod"
                    ? "יוצרת הזמנה..."
                    : "תשלום לשליח (מזומן/ביט)"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}