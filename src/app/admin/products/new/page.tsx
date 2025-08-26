// src/app/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { toast } from "sonner";
import { auth, storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Uploaded = { name: string; url: string };

export default function AdminAddProductPage() {
  const router = useRouter();

  // טופס בסיסי
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    salePrice: "",
    category: CATEGORIES[0]?.slug || "",
    imagesText: "", // אפשר להזין URL-ים ידנית (מופרד בפסיק/שורה)
    colors: "",
    sizes: "", // פורמט: S:10, M:5, L:0
  });

  // ניהול קבצים ותוצאות העלאה
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- עוזרים ---
  function parseImagesText(txt: string): string[] {
    return txt
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseSizes(txt: string) {
    return txt
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [size, stockStr] = pair.split(":").map((x) => x.trim());
        return { size, stock: Number(stockStr || 0) };
      });
  }

  // --- העלאת קבצים ל-Storage ---
  function handleFilesChanged(filesList: FileList | null) {
    if (!filesList || !filesList.length) return;
    const arr = Array.from(filesList);
    setSelectedFiles((prev) => [...prev, ...arr]);
  }

  async function uploadAllSelected() {
    if (!selectedFiles.length) {
      toast.message("בחרי קבצים להעלאה");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      toast.error("צריך להתחבר כ-Admin כדי להעלות תמונות");
      return;
    }

    try {
      setUploading(true);
      const results: Uploaded[] = [];

      for (const file of selectedFiles) {
        // ולידציה בסיסית בצד לקוח – תואם לכללים ב-Storage
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" אינו קובץ תמונה`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`"${file.name}" גדול מ-5MB`);
          continue;
        }

        // NOTE: כדי להתאים ל-rule: match /uploads/{fileName}
        // אנחנו שומרים ישירות תחת uploads/ בלי תתי-תיקיות
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `uploads/${Date.now()}_${safeName}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file, { contentType: file.type });
        const url = await getDownloadURL(storageRef);
        results.push({ name: file.name, url });
      }

      if (results.length) {
        setUploaded((prev) => [...prev, ...results]);
        toast.success(`הועלו ${results.length} תמונות`);
        setSelectedFiles([]); // לנקות בחירה לאחר העלאה מוצלחת
      }
    } catch (e: any) {
      console.error(e);
      toast.error("שגיאה בהעלאת תמונות");
    } finally {
      setUploading(false);
    }
  }

  // --- שמירת מוצר ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.price || !form.category) {
      toast.error("יש למלא שם, מחיר וקטגוריה");
      return;
    }

    // 1) URLs שהועלו עכשיו ל-Storage
    const uploadedUrls = uploaded.map((u) => u.url);

    // 2) URLs מהשדה הידני
    const typedUrls = parseImagesText(form.imagesText);

    // 3) חיבור שניהם
    const images = [...uploadedUrls, ...typedUrls];

    const payload = {
      title: form.title,
      description: form.description || "",
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      category: form.category, // זה ה-slug (למשל "dresses")
      images,                  // ← הדף מפרטי מוצר מצפה לשדה זה
      colors: form.colors
        .split(/[,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      sizes: parseSizes(form.sizes),
      createdAt: Date.now(),
    };

    try {
      setSaving(true);
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        toast.error("צריך להתחבר עם משתמש אדמין כדי לבצע פעולה זו");
        return;
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create product");
      }

      toast.success("המוצר נוסף בהצלחה");
      router.push(`/category/${form.category}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "שגיאה בהוספת מוצר");
    } finally {
      setSaving(false);
    }
  }

  // --- UI ---
  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold text-[#4b3a2f] mb-6">
          הוספת מוצר חדש
        </h1>

        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-1">
            <span>שם מוצר</span>
            <input
              className="border rounded px-3 py-2"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </label>

          <label className="grid gap-1">
            <span>תיאור</span>
            <textarea
              className="border rounded px-3 py-2"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span>מחיר</span>
              <input
                type="number"
                className="border rounded px-3 py-2"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                required
              />
            </label>
            <label className="grid gap-1">
              <span>מחיר מבצע (אופציונלי)</span>
              <input
                type="number"
                className="border rounded px-3 py-2"
                value={form.salePrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salePrice: e.target.value }))
                }
              />
            </label>
          </div>

          <label className="grid gap-1">
            <span>קטגוריה</span>
            <select
              className="border rounded px-3 py-2"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          {/* ====== העלאת תמונות מהמחשב ====== */}
          <div className="grid gap-2">
            <span className="font-medium">העלאת תמונות (מחשב)</span>

            <label className="rounded-lg border-2 border-dashed p-4 text-center cursor-pointer hover:bg-neutral-50">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesChanged(e.target.files)}
              />
              גררי לכאן תמונות או לחצי לבחירה
            </label>

            {selectedFiles.length > 0 && (
              <div className="text-sm text-gray-600">
                נבחרו {selectedFiles.length} קבצים
              </div>
            )}

            <button
              type="button"
              onClick={uploadAllSelected}
              disabled={uploading || selectedFiles.length === 0}
              className="w-fit rounded-full bg-[#c8a18d] text-white px-5 py-2 hover:bg-[#4b3a2f] disabled:opacity-60"
            >
              {uploading ? "מעלה..." : "העלאת הקבצים"}
            </button>

            {uploaded.length > 0 && (
              <div className="mt-2 grid gap-2">
                <div className="text-sm font-medium">תמונות שהועלו:</div>
                <ul className="text-sm list-disc ms-5">
                  {uploaded.map((u, i) => (
                    <li key={i} className="break-all">
                      {u.url}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* אפשרות להוסיף גם URL-ים ידנית */}
          <label className="grid gap-1">
            <span>תמונות נוספות (URL מופרד בפסיק או בשורות)</span>
            <textarea
              className="border rounded px-3 py-2"
              rows={3}
              placeholder="/products/dress1.jpg, https://..."
              value={form.imagesText}
              onChange={(e) =>
                setForm((f) => ({ ...f, imagesText: e.target.value }))
              }
            />
          </label>

          <label className="grid gap-1">
            <span>צבעים (מופרד בפסיק)</span>
            <input
              className="border rounded px-3 py-2"
              placeholder="Black, White, Pink"
              value={form.colors}
              onChange={(e) =>
                setForm((f) => ({ ...f, colors: e.target.value }))
              }
            />
          </label>

          <label className="grid gap-1">
            <span>מידות ומלאי (פורמט: S:10, M:5, L:0)</span>
            <input
              className="border rounded px-3 py-2"
              placeholder="S:10, M:5, L:0"
              value={form.sizes}
              onChange={(e) =>
                setForm((f) => ({ ...f, sizes: e.target.value }))
              }
            />
          </label>

          <button
            disabled={saving}
            className="mt-2 bg-[#c8a18d] text-white px-6 py-2 rounded-full hover:bg-[#4b3a2f] transition disabled:opacity-60"
          >
            {saving ? "שומר..." : "שמור מוצר"}
          </button>
        </form>
      </div>
    </main>
  );
}
