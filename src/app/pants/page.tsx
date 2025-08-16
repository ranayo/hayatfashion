'use client'

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  price: number;
  description: string; 
  imageUrls: string[];
  sizes: string[];
  colors: string[];
};

export default function PantsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, "products"));
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => item.category?.toLowerCase() === "pants");
      setProducts(filtered as Product[]);
    }

    fetchProducts();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">מכנסיים</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow">
            <img src={product.imageUrls[0]} alt={product.title} className="w-full h-64 object-cover rounded-md" />
            <h2 className="mt-2 font-semibold">{product.description}</h2>
            <p className="text-gray-700">{product.price} ₪</p>
            <p className="text-sm text-gray-500">מידות: {product.sizes.join(", ")}</p>
            <p className="text-sm text-gray-500">צבעים: {product.colors.join(", ")}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
