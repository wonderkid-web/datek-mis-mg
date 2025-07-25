import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { Brand } from "./types";

const brandsCollectionRef = collection(db, "brands");

export const createBrand = async (
  item: Omit<Brand, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(brandsCollectionRef, newItem);
  return docRef.id;
};

export const getBrands = async (): Promise<Brand[]> => {
  const q = query(brandsCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as Brand;
  });
};

export const updateBrand = async (
  id: string,
  item: Partial<Omit<Brand, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "brands", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteBrand = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "brands", id);
  await deleteDoc(itemDoc);
};
