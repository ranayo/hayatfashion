"use client";

import { useEffect, useState } from "react";

export default function ThankYouPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCOD, setIsCOD] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get("order");
    const codParam = params.get("cod") === "1";

    setOrderId(orderParam);
    setIsCOD(codParam);

    // ✅ נטען את הנתונים מה-localStorage בלבד
    const checkoutStr = localStorage.getItem("hayat_checkout");
    if (checkoutStr) {
      try {
        const parsed = JSON.parse(checkoutStr);
        setCheckoutData(parsed);
      } catch (err) {
        console.error("Error parsing checkout data:", err);
      }
    }

    // 🧹 מנקים את העגלה לאחר אישור
    localStorage.removeItem("hayat_cart");
  }, []);

  if (!checkoutData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f2ef] px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg">
          <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-4">
            תודה על ההזמנה שלך 🎉
          </h1>
          <p className="text-gray-700">
            טוען את פרטי ההזמנה...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f2ef] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-4">
          🎉 תודה על ההזמנה שלך!
        </h1>

        {orderId && (
          <p className="text-[#3f2f26] mb-2">
            מספר הזמנה: <b>{orderId}</b>
          </p>
        )}

        <div className="text-[#3f2f26] mb-4 space-y-1 text-right">
          <p>👤 שם: {checkoutData.fullName || "-"}</p>
          <p>📞 טלפון: {checkoutData.phone || "-"}</p>
          <p>🏙️ עיר: {checkoutData.city || "-"}</p>
          <p>🏠 רחוב: {checkoutData.street || "-"}</p>
          <p>💬 הערות: {checkoutData.notes || "—"}</p>
          <p>
            💰 סה״כ לתשלום:{" "}
            <b>
              {checkoutData.total
                ? checkoutData.total.toLocaleString("he-IL", {
                    style: "currency",
                    currency: "ILS",
                  })
                : "—"}
            </b>
          </p>
        </div>

        <p className="text-gray-700">
          {isCOD
            ? "בחרת לשלם במזומן או בביט לשליח. ניצור איתך קשר לתיאום המסירה."
            : "התשלום עבר בהצלחה. אנו מכינים את ההזמנה למשלוח."}
        </p>

        <p className="text-green-600 mt-4">ההזמנה נשמרה בהצלחה ✅</p>

        <a
          href="/"
          className="inline-block mt-6 rounded-full px-6 py-2 border border-[#c8a18d] hover:bg-[#c8a18d] hover:text-white transition"
        >
          חזרה לעמוד הבית
        </a>
      </div>
    </main>
  );
}