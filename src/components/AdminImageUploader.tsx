"use client";

import { useState } from "react";
import { storage } from "@/firebase";
import { auth } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

type Props = {
  onUploaded: (urls: string[]) => void; // נקרא אחרי העלאה כדי להזרים URL-ים לטופס שלך
  folder?: string;                      // למשל "uploads"
  multiple?: boolean;
};

export default function AdminImageUploader({ onUploaded, folder = "uploads", multiple = true }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    // חייבים להיות מחוברים כ-admin (לפי חוקי ה-Storage שהגדרת)
    const user = auth.currentUser;
    if (!user) {
      toast.error("יש להתחבר כ-Admin כדי להעלות תמונות");
      return;
    }

    try {
      setBusy(true);
      const urls: string[] = [];

      // מעלים אחת-אחת (פשוט ויציב)
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`'${file.name}' אינו קובץ תמונה`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`'${file.name}' גדול מ-5MB`);
          continue;
        }

        const safeName = file.name.replace(/[^\w.\-]/g, "_");
        const path = `${folder}/${user.uid}/${Date.now()}-${safeName}`;
        const storageRef = ref(storage, path);

        const snap = await uploadBytes(storageRef, file, {
          contentType: file.type,
        });
        const url = await getDownloadURL(snap.ref);
        urls.push(url);
      }

      if (urls.length) {
        onUploaded(urls);
        toast.success(`הועלו ${urls.length} תמונות`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "שגיאה בהעלאת תמונות");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-full border hover:bg-gray-50">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {busy ? "מעלה..." : "בחרי תמונות"}
      </label>
      <span className="text-xs text-gray-500">עד 5MB לתמונה</span>
    </div>
  );
}
