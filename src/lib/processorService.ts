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
import { Processor } from "./types";

const processorsCollectionRef = collection(db, "processors");

export const createProcessor = async (
  item: Omit<Processor, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(processorsCollectionRef, newItem);
  return docRef.id;
};

export const getProcessors = async (): Promise<Processor[]> => {
  const q = query(processorsCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as Processor;
  });
};

export const updateProcessor = async (
  id: string,
  item: Partial<Omit<Processor, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "processors", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteProcessor = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "processors", id);
  await deleteDoc(itemDoc);
};
