"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  name: string;
  description: string;
  category: string;
  price: string;   // נשמר כמחרוזת בטופס ומומר למספר בשרת
  sizes: string;   // "S, M, L"
  colors: string;  // "beige, black"
  image: File | null;
};

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    category: "pants",
    price: "",
    sizes: "",
    colors: "",
    image: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;
    if (name === "image" && files && files[0]) {
      setForm((f) => ({ ...f, image: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // צמצום טיפוס: אם אין קובץ – מפסיקים; אחרת זה File ולא null
    const imageFile = form.image;
    if (!imageFile) {
      alert("נא להעלות תמונה!");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("price", form.price);
    fd.append("sizes", form.sizes);
    fd.append("colors", form.colors);
    // ⬅️ פה התיקון: מוסיפים File אמיתי + שם קובץ
    fd.append("image", imageFile, imageFile.name);

    try {
      const res = await fetch("/api/products", { method: "POST", body: fd });
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        alert(`שגיאה מהשרת (${res.status}): ${data?.error || text || "unknown"}`);
        return;
      }

      alert("המוצר נוסף בהצלחה!");
      setForm({
        name: "",
        description: "",
        category: "pants",
        price: "",
        sizes: "",
        colors: "",
        image: null,
      });
      router.push(`/category/${form.category}`);
    } catch (err: any) {
      alert("שגיאה ברשת: " + (err?.message || String(err)));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">הוספת מוצר חדש</h1>

      <input name="name" placeholder="שם מוצר" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />

      <textarea name="description" placeholder="תיאור" value={form.description} onChange={handleChange} className="w-full border p-2 rounded min-h-28" required />

      <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="pants">Pants</option>
        <option value="dresses">Dresses</option>
        <option value="shirts">Shirts</option>
        <option value="skirts">Skirts</option>
        <option value="accessories">Accessories</option>
        <option value="jackets">Jackets</option>
        <option value="abayas">Abayas</option>
        <option value="suits">Suits</option>
        <option value="basics">Basics</option>
      </select>

      <input name="price" placeholder="מחיר" type="number" step="0.01" value={form.price} onChange={handleChange} className="w-full border p-2 rounded" required />

      <input name="sizes" placeholder='מידות (למשל: "S, M, L")' value={form.sizes} onChange={handleChange} className="w-full border p-2 rounded" />

      <input name="colors" placeholder='צבעים (למשל: "beige, black")' value={form.colors} onChange={handleChange} className="w-full border p-2 rounded" />

      <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full" required />

      <button type="submit" className="bg-[#c8a18d] text-white px-6 py-2 rounded-full hover:bg-[#4b3a2f]">
        הוספת מוצר
      </button>
    </form>
  );
}
