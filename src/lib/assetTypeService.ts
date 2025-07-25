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
import { AssetType } from "./types";

const assetTypesCollectionRef = collection(db, "assetTypes");

export const createAssetType = async (
  item: Omit<AssetType, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItem = {
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(assetTypesCollectionRef, newItem);
  return docRef.id;
};

export const getAssetTypes = async (): Promise<AssetType[]> => {
  const q = query(assetTypesCollectionRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : undefined,
    } as AssetType;
  });
};

export const updateAssetType = async (
  id: string,
  item: Partial<Omit<AssetType, "id" | "createdAt">>
): Promise<void> => {
  const itemDoc = doc(db, "assetTypes", id);
  await updateDoc(itemDoc, { ...item, updatedAt: new Date() });
};

export const deleteAssetType = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "assetTypes", id);
  await deleteDoc(itemDoc);
};
