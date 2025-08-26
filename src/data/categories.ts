// src/data/categories.ts
export type Category = {
  slug: string;         // מה שיופיע ב-URL
  title: string;        // הכותרת למשתמש
  image: string;        // תמונת עיגול בתצוגת קטגוריות
};

export const CATEGORIES: Category[] = [
  { slug: "shirts",      title: "Shirts",      image: "/categories/shirts.jpg" },
  { slug: "basics",      title: "Basics",      image: "/categories/basics.jpg" },
  { slug: "pants",       title: "Pants",       image: "/categories/pants.jpg" },
  { slug: "suits",       title: "Suits",       image: "/categories/suits.jpg" },
  { slug: "accessories", title: "Accessories", image: "/categories/accessories.jpg" },
  { slug: "dresses",     title: "Dresses",     image: "/categories/dresses.jpg" },
  { slug: "skirts",      title: "Skirts",      image: "/categories/skirts.jpg" },
  { slug: "abayas",      title: "Abayas",      image: "/categories/abayas.jpg" },
  { slug: "jackets",     title: "Jackets",     image: "/categories/jackets.jpg" },
];

// עוזר: מביא אובייקט קטגוריה מתוך הסלאג (או undefined אם לא קיימת)
export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find(c => c.slug === slug);
}
