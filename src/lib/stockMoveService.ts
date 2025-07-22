import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { StockMove } from './types';

const stockMovesCollectionRef = collection(db, 'stockMoves');

export const createStockMove = async (stockMove: Omit<StockMove, 'id' | 'createdAt'>): Promise<string> => {
  const newStockMove = {
    ...stockMove,
    createdAt: new Date(),
  };
  const docRef = await addDoc(stockMovesCollectionRef, newStockMove);
  return docRef.id;
};

export const getStockMovesByItemId = async (itemId: string): Promise<StockMove[]> => {
  const q = query(stockMovesCollectionRef, where("itemId", "==", itemId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    item: doc.data().item || '', // Ensure item is included
    guaranteeDate: doc.data().guaranteeDate.toDate(),
  })) as StockMove[];
};

export const getStockMoves = async (): Promise<StockMove[]> => {
  const q = query(stockMovesCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    item: doc.data().item || '', // Ensure item is included
    guaranteeDate: doc.data().guaranteeDate.toDate(),
  })) as StockMove[];
};


export const updateStockMove = async (id: string, stockMove: Partial<Omit<StockMove, 'id' | 'createdAt'>>): Promise<void> => {
  const stockMoveDocRef = doc(db, 'stockMoves', id);

  const updatedData: Partial<StockMove> = {
    ...stockMove,
  };

  await updateDoc(stockMoveDocRef, updatedData);
};

export const deleteStockMove = async (id: string): Promise<void> => {
  const stockMoveDocRef = doc(db, 'stockMoves', id);
  await deleteDoc(stockMoveDocRef);
};

export const getFrequentItems = async (): Promise<{ name: string; moves: number }[]> => {
  const stockMoves = await getStockMoves();
  const itemCounts: { [key: string]: number } = {};

  stockMoves.forEach(move => {
    itemCounts[move.item] = (itemCounts[move.item] || 0) + 1;
  });

  const sortedItems = Object.entries(itemCounts)
    .map(([name, moves]) => ({ name, moves }))
    .sort((a, b) => b.moves - a.moves);

  return sortedItems;
};

export const getStockMoveTrend = async (): Promise<{ date: string; count: number }[]> => {
  const stockMoves = await getStockMoves();
  const dailyCounts: { [key: string]: number } = {};

  stockMoves.forEach(move => {
    const date = new Date(move.createdAt).toISOString().split('T')[0]; // Format YYYY-MM-DD
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const sortedDates = Object.keys(dailyCounts).sort();

  return sortedDates.map(date => ({
    date,
    count: dailyCounts[date],
  }));
};

export const getStockMoveTrendByItemId = async (itemId: string): Promise<{ date: string; count: number }[]> => {
  const q = query(stockMovesCollectionRef, where("item", "==", itemId), orderBy("createdAt", "asc"));
  const querySnapshot = await getDocs(q);
  const stockMoves = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    guaranteeDate: doc.data().guaranteeDate.toDate(),
    item: doc.data().item || '', // Ensure item is included
  })) as StockMove[];

  const dailyCounts: { [key: string]: number } = {};

  stockMoves.forEach(move => {
    const date = new Date(move.createdAt).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const sortedDates = Object.keys(dailyCounts).sort();

  return sortedDates.map(date => ({
    date,
    count: dailyCounts[date],
  }));
};



