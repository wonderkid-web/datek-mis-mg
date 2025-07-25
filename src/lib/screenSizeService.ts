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
import { ScreenSize } from "./types";

const screenSizesCollectionRef = collection(db, "screenSizes");

export const createScreenSize = async (
  item: Omit<ScreenSize, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(screenSizesCollectionRef, newItem);
  return docRef.id;
};

export const getScreenSizes = async (): Promise<ScreenSize[]> => {
  const q = query(screenSizesCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as ScreenSize;
  });
};

export const updateScreenSize = async (
  id: string,
  item: Partial<Omit<ScreenSize, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "screenSizes", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteScreenSize = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "screenSizes", id);
  await deleteDoc(itemDoc);
};
