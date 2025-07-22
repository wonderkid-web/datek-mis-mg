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
} from "firebase/firestore";
import { Item } from "./types";
import { getStockMoves } from "./stockMoveService";

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

export const getItems = async (): Promise<Item[]> => {
  const q = query(itemsCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Item[];
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
    return { id: docSnap.id, ...docSnap.data() } as Item;
  } else {
    return null;
  }
};

export const getItemsBySbu = async (): Promise<
  { sbu: string; count: number }[]
> => {
  const stockMoves = await getStockMoves();
  const sbuCounts: { [key: string]: number } = {};

  stockMoves.forEach(move => {
    sbuCounts[move.sbu] = (sbuCounts[move.sbu] || 0) + 1;
  });

  return Object.entries(sbuCounts).map(([sbu, count]) => ({
    sbu,
    count,
  }));
};
