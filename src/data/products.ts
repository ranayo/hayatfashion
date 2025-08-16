export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  sizes: string[];
  category: string;
};

export const products: Product[] = [
  {
    id: "dress-1",
    name: "Elegant Evening Dress",
    image: "/products/dress-1.jpg",
    price: 250,
    sizes: ["S", "M", "L"],
    category: "dresses",
  },
  {
    id: "pant-1",
    name: "Classic Wide Pants",
    image: "/products/pant-1.jpg",
    price: 180,
    sizes: ["M", "L"],
    category: "pants",
  },
  // תוסיפי כאן עוד מוצרים לפי הצורך
];
