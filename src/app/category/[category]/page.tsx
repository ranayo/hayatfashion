import { notFound } from "next/navigation";

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;

  const availableCategories = ["pants", "jackets", "skirts", "suits", "shirts", "dresses", "accessories", "abayas"]; // ועוד

  if (!availableCategories.includes(category)) {
    notFound(); // תציג 404 אם הקטגוריה לא קיימת
  }

  return (
    <main className="min-h-screen p-8 bg-[#f9f7f4] text-[#1c1c1c] font-poppins">
      <h1 className="text-3xl font-bold mb-6 capitalize">{category}</h1>
      {/* כאן נוסיף את כרטיסי המוצרים לפי הקטגוריה בהמשך */}
    </main>
  );
}
