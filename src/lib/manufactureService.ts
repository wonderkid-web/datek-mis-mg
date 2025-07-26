import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Manufacture } from "./types";

const manufactureCollectionRef = collection(db, "manufactures");

export const createManufacture = async (
  item: Omit<Manufacture, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const docRef = await addDoc(manufactureCollectionRef, newItem);
  return docRef.id;
};

export const getManufactures = async (assetType: string): Promise<Manufacture[]> => {
  console.log("Fetching manufactures for assetType:", assetType);
  const q = query(manufactureCollectionRef, where("assetCategory", "==", assetType));

  const querySnapshot = await getDocs(q);
  const manufactures = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Manufacture;
  });
  console.log("Fetched manufactures data:", manufactures);
  return manufactures;
};

export const getManufactureById = async (id: string): Promise<Manufacture | null> => {
  const docRef = doc(db, "manufactures", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Manufacture;
  } else {
    return null;
  }
};

export const updateManufacture = async (
  id: string,
  item: Partial<Omit<Manufacture, "id" | "createdAt">>
): Promise<void> => {
  const manufactureDoc = doc(db, "manufactures", id);
  await updateDoc(manufactureDoc, { ...item, updatedAt: Timestamp.now() });
};
