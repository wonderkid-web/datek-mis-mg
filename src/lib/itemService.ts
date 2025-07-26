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
  getDoc,
  where,
} from "firebase/firestore";
import { Item } from "./types";

const itemsCollectionRef = collection(db, "items");

export const createItem = async (
  item: Omit<Item, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(itemsCollectionRef, newItem);
  return docRef.id;
};

export const getItems = async (assetType?: string): Promise<Item[]> => {
  let q = query(itemsCollectionRef, orderBy("createdAt", "desc"));
  if (assetType) {
    q = query(q, where("name", "==", assetType));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
      guaranteeDate: data.guaranteeDate ? new Date(data.guaranteeDate.toDate()) : undefined,
      registrationDate: data.registrationDate ? new Date(data.registrationDate.toDate()) : undefined,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate.toDate()) : undefined,
    } as Item;
  });
};

export const updateItem = async (
  id: string,
  item: Partial<Omit<Item, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "items", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteItem = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "items", id);
  await deleteDoc(itemDoc);
};

export const getItemById = async (id: string): Promise<Item | null> => {
  const itemDoc = doc(db, "items", id);
  const docSnap = await getDoc(itemDoc);
  if (docSnap.exists() && !docSnap.data().isDeleted) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
      guaranteeDate: data.guaranteeDate ? new Date(data.guaranteeDate) : undefined,
      registrationDate: data.registrationDate ? new Date(data.registrationDate) : undefined,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined,
    } as Item;
  } else {
    return null;
  }
};