// src/app/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { toast } from "sonner";

// Firebase (קליינט)
import { auth, storage, db } from "@/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type Uploaded = { name: string; url: string };

export default function AdminAddProductPage() {
  const router = useRouter();

  // טופס
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    salePrice: "",
    category: CATEGORIES[0]?.slug || "",
    imagesText: "",
    colors: "",
    sizes: "",
  });

  // מצב העלאות/שמירה
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---- עוזרים ----
  function parseImagesText(txt: string): string[] {
    return txt.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  }
  function parseSizes(txt: string) {
    return txt
      .split(/[,]+/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(pair => {
        const [size, stockStr] = pair.split(":").map(x => x.trim());
        return { size, stock: Number(stockStr || 0) };
      });
  }
  // מגן נגד תקיעות – מפרק הבטחה אחרי X מילישניות
  function withTimeout<T>(p: Promise<T>, ms = 30000) {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), ms);
      p.then(v => { clearTimeout(t); resolve(v); })
       .catch(e => { clearTimeout(t); reject(e); });
    });
  }

  // ---- העלאת קבצים (אוטומטית) ל-Storage ----
  async function handleFilesChanged(filesList: FileList | null) {
    if (!filesList?.length) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("צריך להתחבר כ-Admin כדי להעלות תמונות");
      return;
    }

    setUploading(true);
    const results: Uploaded[] = [];

    try {
      for (const file of Array.from(filesList)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" אינו קובץ תמונה`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`"${file.name}" גדול מ-5MB`);
          continue;
        }

        const safeName = file.name.replace(/\s+/g, "_");
        const path = `uploads/${user.uid}/${Date.now()}_${safeName}`;
        const sref = ref(storage, path);

        await withTimeout(
          new Promise<void>((resolve) => {
            const task = uploadBytesResumable(sref, file, { contentType: file.type });

            task.on(
              "state_changed",
              (snap) => {
                const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                // אפשר להציג בר פרוגרס אם תרצי
                // console.log(`[UPLOAD] ${file.name}: ${pct}%`);
              },
              (err) => {
                console.error("Upload error:", err.code, err.message);
                toast.error(`שגיאה בהעלאה: ${err.code || "upload_error"}`);
                resolve(); // לא נתקעות – ממשיכות לקובץ הבא
              },
              async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                results.push({ name: file.name, url });
                resolve();
              }
            );
          })
        );
      }

      if (results.length) {
        setUploaded((prev) => [...prev, ...results]);
        toast.success(`הועלו ${results.length} תמונות`);
      } else {
        toast.message("לא הועלו קבצים");
      }
    } catch (e: any) {
      toast.error(
        e?.message === "UPLOAD_TIMEOUT"
          ? "העלאה נתקעה — נסי שוב"
          : (e?.message || "שגיאה בהעלאת תמונות")
      );
    } finally {
      setUploading(false);
      const input = document.getElementById("file-input") as HTMLInputElement | null;
      if (input) input.value = ""; // אפשר לבחור שוב את אותו קובץ
    }
  }

  // ---- שמירת מוצר ישירות ל-Firestore (ללא API) ----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.price || !form.category) {
      toast.error("יש למלא שם, מחיר וקטגוריה");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("יש להתחבר כדי לשמור מוצר");
      return;
    }

    const images = [
      ...uploaded.map((u) => u.url),
      ...parseImagesText(form.imagesText),
    ];

    const docToSave = {
      title: form.title,
      description: form.description || "",
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      category: String(form.category).toLowerCase(),
      images,
      colors: form.colors
        .split(/[,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      sizes: parseSizes(form.sizes),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      setSaving(true);
      await addDoc(collection(db, "products"), docToSave);
      toast.success("המוצר נוסף בהצלחה");
      router.push(`/category/${form.category}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.code || err?.message || "שגיאה בהוספת מוצר");
    } finally {
      setSaving(false);
    }
  }

  // ---- UI ----
  return (
    <main className="min-h-screen bg-[#f6f2ef] px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold text-[#4b3a2f] mb-2">
          הוספת מוצר חדש
        </h1>

        <div className="mb-4 text-xs text-gray-500">
          {auth.currentUser
            ? `logged in as: ${auth.currentUser.email}`
            : "NOT LOGGED IN"}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-1">
            <span>שם מוצר</span>
            <input
              className="border rounded px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
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

          {/* העלאת תמונות אוטומטית */}
          <div className="grid gap-2">
            <span className="font-medium">תמונות (מחשב) — העלאה אוטומטית</span>

            <label className="rounded-lg border-2 border-dashed p-4 text-center cursor-pointer hover:bg-neutral-50">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesChanged(e.target.files)}
              />
              גררי לכאן תמונות או לחצי לבחירה
            </label>

            {uploading && <div className="text-sm text-gray-600">מעלה…</div>}

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

                <div className="grid grid-cols-3 gap-2">
                  {uploaded.map((u, i) => (
                    <img
                      key={`img-${i}`}
                      src={u.url}
                      alt={u.name}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* URL-ים ידניים */}
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
              onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
            />
          </label>

          <label className="grid gap-1">
            <span>מידות ומלאי (פורמט: S:10, M:5, L:0)</span>
            <input
              className="border rounded px-3 py-2"
              placeholder="S:10, M:5, L:0"
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
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
