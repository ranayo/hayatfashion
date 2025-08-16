'use client';

import { useState } from 'react';
import { db, storage } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const categories = ['pants', 'shirts', 'dresses', 'basics', 'accessories'];
const sizes = ['S', 'M', 'L', 'XL'];
const colors = ['BLACK', 'WHITE', 'GRAY', 'BEIGE', 'BLUE', 'PINK'];

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pants');
  const [price, setPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckbox = (value: string, list: string[], setter: any) => {
    if (list.includes(value)) {
      setter(list.filter(item => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !price || !imageFile) return alert('All fields are required!');
    try {
      setLoading(true);
      const imageRef = ref(storage, `products/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageURL = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'products'), {
        title,
        description,
        category,
        price: parseFloat(price),
        sizes: selectedSizes,
        colors: selectedColors,
        images: [imageURL],
        isActive: true,
        createdAt: Date.now(),
      });

      alert('Product added!');
      setTitle(''); setDescription(''); setPrice('');
      setSelectedSizes([]); setSelectedColors([]); setImageFile(null);
    } catch (err) {
      console.error(err);
      alert('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>

      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="input mb-2 w-full" />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="input mb-2 w-full" />
      <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} type="number" className="input mb-2 w-full" />

      <label className="block mt-2">Category</label>
      <select value={category} onChange={e => setCategory(e.target.value)} className="input mb-2 w-full">
        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>

      <label className="block mt-2">Sizes</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {sizes.map(size => (
          <label key={size} className="flex items-center gap-1">
            <input type="checkbox" checked={selectedSizes.includes(size)} onChange={() => handleCheckbox(size, selectedSizes, setSelectedSizes)} />
            {size}
          </label>
        ))}
      </div>

      <label className="block mt-2">Colors</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {colors.map(color => (
          <label key={color} className="flex items-center gap-1">
            <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => handleCheckbox(color, selectedColors, setSelectedColors)} />
            {color}
          </label>
        ))}
      </div>

      <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="mb-4" />

      <button onClick={handleSubmit} disabled={loading} className="bg-[#c8a18d] text-white rounded-full px-6 py-2">
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </div>
  );
}
