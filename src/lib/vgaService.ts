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
import { Vga } from "./types";

const vgasCollectionRef = collection(db, "vgas");

export const createVga = async (
  item: Omit<Vga, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(vgasCollectionRef, newItem);
  return docRef.id;
};

export const getVgas = async (): Promise<Vga[]> => {
  const q = query(vgasCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as Vga;
  });
};

export const updateVga = async (
  id: string,
  item: Partial<Omit<Vga, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "vgas", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteVga = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "vgas", id);
  await deleteDoc(itemDoc);
};
