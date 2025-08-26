// src/lib/upload.ts
import { storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadProductImages(files: File[], uid: string) {
  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 5 * 1024 * 1024) continue;

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `uploads/admin/${uid}/${filename}`;

    const storageRef = ref(storage, path);
    const snap = await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(snap.ref);
    urls.push(url);
  }

  return urls;
}
