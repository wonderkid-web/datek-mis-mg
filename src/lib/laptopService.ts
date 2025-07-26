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
import { Laptop } from "./types";

const laptopsCollection = collection(db, "laptops");

export const createLaptop = async (laptop: Omit<Laptop, "id" | "createdAt" | "updatedAt">) => {
  const newLaptop = {
    ...laptop,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await addDoc(laptopsCollection, newLaptop);
};

export const getLaptops = async (): Promise<Laptop[]> => {
  const q = query(laptopsCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Laptop[];
};

export const updateLaptop = async (id: string, updates: Partial<Laptop>) => {
  const laptopDoc = doc(db, "laptops", id);
  await updateDoc(laptopDoc, { ...updates, updatedAt: new Date() });
};

export const deleteLaptop = async (id: string) => {
  const laptopDoc = doc(db, "laptops", id);
  await deleteDoc(laptopDoc);
};
