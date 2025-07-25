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
import { Color } from "./types";

const colorsCollectionRef = collection(db, "colors");

export const createColor = async (
  item: Omit<Color, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(colorsCollectionRef, newItem);
  return docRef.id;
};

export const getColors = async (): Promise<Color[]> => {
  const q = query(colorsCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as Color;
  });
};

export const updateColor = async (
  id: string,
  item: Partial<Omit<Color, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "colors", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteColor = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "colors", id);
  await deleteDoc(itemDoc);
};
