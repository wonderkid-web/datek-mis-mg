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
import { Storage } from "./types";

const storagesCollectionRef = collection(db, "storages");

export const createStorage = async (
  item: Omit<Storage, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(storagesCollectionRef, newItem);
  return docRef.id;
};

export const getStorages = async (): Promise<Storage[]> => {
  const q = query(storagesCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as Storage;
  });
};

export const updateStorage = async (
  id: string,
  item: Partial<Omit<Storage, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "storages", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteStorage = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "storages", id);
  await deleteDoc(itemDoc);
};
