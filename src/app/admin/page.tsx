"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { toast } from "sonner";
import {
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  ClipboardList,
} from "lucide-react";

// אימיילים של אדמינים מתוך קובץ env
const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
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
      <h1 className="text-3xl font-semibold text-center text-[#4b3a2f] mb-10">
        Admin Dashboard
      </h1>

      {/* Grid של כרטיסים */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* ניהול מוצרים */}
        <Link
          href="/admin/products"
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
        >
          <Package className="w-10 h-10 text-[#c8a18d]" />
          <h2 className="mt-3 text-lg font-semibold text-[#4b3a2f]">
            ניהול מוצרים
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            רשימה, חיפוש, פעולה מהירה
          </p>
        </Link>

        {/* הוספת מוצר חדש */}
        <Link
          href="/admin/products/new"
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
        >
          <PlusCircle className="w-10 h-10 text-[#c8a18d]" />
          <h2 className="mt-3 text-lg font-semibold text-[#4b3a2f]">
            הוספת מוצר חדש
          </h2>
          <p className="text-sm text-gray-500 mt-1">טופס יצירה</p>
        </Link>

        {/* ניהול הזמנות */}
        <Link
          href="/admin/orders"
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
        >
          <ShoppingBag className="w-10 h-10 text-[#c8a18d]" />
          <h2 className="mt-3 text-lg font-semibold text-[#4b3a2f]">
            ניהול הזמנות
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            צפייה בעסקאות, עדכון סטטוס ותשלומים
          </p>
        </Link>

        {/* ניהול משתמשים */}
        <Link
          href="/admin/users"
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
        >
          <Users className="w-10 h-10 text-[#c8a18d]" />
          <h2 className="mt-3 text-lg font-semibold text-[#4b3a2f]">
            ניהול משתמשים
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            צפייה, מחיקה, עדכון הרשאות
          </p>
        </Link>

        {/* ניהול מלאי */}
        <Link
          href="/admin/inventory"
          className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
        >
          <ClipboardList className="w-10 h-10 text-[#c8a18d]" />
          <h2 className="mt-3 text-lg font-semibold text-[#4b3a2f]">
            ניהול מלאי
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            עדכון כמויות, מעקב והתרעות
          </p>
        </Link>
      </div>

      {/* הודעת גישה */}
      {!ok && (
        <p className="text-center text-gray-500 mt-6">
          כניסה מותרת לאדמינים בלבד.
        </p>
      )}
    </main>
  );
}
