import { db } from "./firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { StockMove } from "./types";

const stockMovesCollectionRef = collection(db, "stock_moves");

export const getStockMovesByItemId = async (itemId: string): Promise<StockMove[]> => {
  const q = query(
    stockMovesCollectionRef,
    where("itemId", "==", itemId),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : undefined,
  })) as StockMove[];
};
