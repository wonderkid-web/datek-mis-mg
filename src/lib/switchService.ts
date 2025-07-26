import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Switch } from "./types";

const switchesCollectionRef = collection(db, "switches");

export const createSwitch = async (
  item: Omit<Switch, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(switchesCollectionRef, newItem);
  return docRef.id;
};

export const getSwitches = async (): Promise<Switch[]> => {
  const q = query(switchesCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as Switch;
  });
};

export const updateSwitch = async (
  id: string,
  item: Partial<Switch>
): Promise<void> => {
  const itemRef = doc(db, "switches", id);
  await updateDoc(itemRef, { ...item, updatedAt: new Date() });
};

export const deleteSwitch = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "switches", id));
};
