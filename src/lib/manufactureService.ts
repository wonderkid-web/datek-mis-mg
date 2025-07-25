import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { ManufacturedItem } from "./types";

const manufacturedItemsCollectionRef = collection(db, "manufacturedItems");

export const createManufacturedItem = async (
  item: Omit<ManufacturedItem, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(manufacturedItemsCollectionRef, newItem);
  return docRef.id;
};

export const getManufacturedItems = async (): Promise<ManufacturedItem[]> => {
  const q = query(manufacturedItemsCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as ManufacturedItem;
  });
};
