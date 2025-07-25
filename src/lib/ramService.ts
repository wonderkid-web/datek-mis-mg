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
import { Ram } from "./types";

const ramsCollectionRef = collection(db, "rams");

export const createRam = async (
  item: Omit<Ram, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(ramsCollectionRef, newItem);
  return docRef.id;
};

export const getRams = async (): Promise<Ram[]> => {
  const q = query(ramsCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as Ram;
  });
};

export const updateRam = async (
  id: string,
  item: Partial<Omit<Ram, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "rams", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteRam = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "rams", id);
  await deleteDoc(itemDoc);
};
