"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  // ✉️ אימיילים של אדמינים מתוך ENV
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // 🧩 בדיקת הרשאה
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

  // 📥 שליפת המשתמשים
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList: User[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          userList.push({
            id: docSnap.id,
            email: data.email,
            isAdmin: data.isAdmin ?? false,
            createdAt: data.createdAt?.toDate?.().toLocaleString?.() ?? "",
          });
        });
        setUsers(userList);
      } catch (err) {
        console.error("❌ שגיאה בשליפת משתמשים:", err);
        toast.error("שגיאה בטעינת רשימת המשתמשים");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  // 🗑 מחיקת משתמש
  const handleDelete = async (id: string) => {
    if (!confirm("בטוחה שברצונך למחוק משתמש זה?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("המשתמש נמחק בהצלחה");
    } catch (err) {
      console.error("❌ שגיאה במחיקה:", err);
      toast.error("שגיאה במחיקת המשתמש");
    }
  };

  // 👑 הפיכת משתמש לאדמין
  const toggleAdmin = async (id: string, current: boolean) => {
    try {
      const ref = doc(db, "users", id);
      await updateDoc(ref, { isAdmin: !current });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isAdmin: !current } : u))
      );
      toast.success(`המשתמש עודכן (${!current ? "הפוך לאדמין" : "הוסר אדמין"})`);
    } catch (err) {
      console.error("❌ שגיאה בעדכון isAdmin:", err);
      toast.error("שגיאה בעדכון המשתמש");
    }
  };

  if (isAdmin === null)
    return <p className="text-center py-10">בודק הרשאות...</p>;
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#f6f2ef] text-[#4b3a2f] p-8">
      <h1 className="text-3xl font-semibold mb-8 text-center">
        👥 ניהול משתמשים
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">טוען נתונים...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">אין משתמשים רשומים</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl shadow">
            <thead>
              <tr className="bg-[#c8a18d] text-white">
                <th className="py-3 px-4 text-right">אימייל</th>
                <th className="py-3 px-4 text-right">נוצר ב־</th>
                <th className="py-3 px-4 text-right">מנהל?</th>
                <th className="py-3 px-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-[#f9f7f4] transition"
                >
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.createdAt}</td>
                  <td className="py-2 px-4">
                    {user.isAdmin ? "✅ כן" : "❌ לא"}
                  </td>
                  <td className="py-2 px-4 text-center space-x-2">
                    <button
                      onClick={() => toggleAdmin(user.id, user.isAdmin)}
                      className="bg-[#c8a18d] hover:bg-[#4b3a2f] text-white px-3 py-1 rounded-full"
                    >
                      {user.isAdmin ? "הסר אדמין" : "הפוך לאדמין"}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-full"
                    >
                      מחק
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
