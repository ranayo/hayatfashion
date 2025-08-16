import { db } from './config'
import { collection, getDocs } from 'firebase/firestore'

export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, 'products'))
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))
}
