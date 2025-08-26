"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { toast } from "sonner";

const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export default function AdminDashboard() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      toast.error("התחברי כדי להיכנס לאדמין");
      setOk(false);
      return;
    }
    const email = (u.email || "").toLowerCase();
    if (!admins.includes(email)) {
      toast.error("אין הרשאה לאדמין");
      setOk(false);
      return;
    }
    setOk(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8 text-[#4b3a2f]">
        Admin Dashboard
      </h1>

      <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
        <Link href="/admin/products" className="rounded-xl bg-white p-6 shadow hover:shadow-md transition">
          <div className="text-[#3f2f26] font-semibold">ניהול מוצרים</div>
          <div className="text-gray-600 text-sm mt-1">רשימה, חיפוש, פעולה מהירה</div>
        </Link>

        <Link href="/admin/products/new" className="rounded-xl bg-white p-6 shadow hover:shadow-md transition">
          <div className="text-[#3f2f26] font-semibold">הוספת מוצר חדש</div>
          <div className="text-gray-600 text-sm mt-1">טופס יצירה</div>
        </Link>
      </div>

      {!ok && (
        <p className="text-center text-gray-500 mt-6">
          כניסה מותרת לאדמינים בלבד.
        </p>
      )}
    </main>
  );
}
