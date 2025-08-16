// src/types/index.ts
export type SizeOption = { size: string; stock: number };

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: "ILS" | "USD";
  category:
    | "pants" | "basics" | "shirts" | "dresses"
    | "accessories" | "suits" | "jackets" | "abayas" | "skirts";
  colors: string[];
  images: string[];
  rating?: number;
  createdAt: number;
  updatedAt: number;
  sizes: SizeOption[];
  tags?: string[];
  isActive: boolean;
};
