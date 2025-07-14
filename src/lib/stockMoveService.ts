import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { StockMove } from './types';
import { getItemById, updateItem } from './itemService';

const stockMovesCollectionRef = collection(db, 'stockMoves');

export const createStockMove = async (stockMove: Omit<StockMove, 'id' | 'createdAt' | 'itemName'>): Promise<string> => {
  const { itemId, quantity } = stockMove;

  const item = await getItemById(itemId);
  if (!item) {
    throw new Error('Item not found');
  }

  if (item.quantity < quantity) {
    throw new Error('Insufficient stock for this item in the source SBU.');
  }

  await updateItem(itemId, { quantity: item.quantity - quantity });

  const newStockMove = {
    ...stockMove,
    itemName: item.name, // Denormalize item name
    moveDate: new Date(stockMove.moveDate),
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
    moveDate: doc.data().moveDate.toDate(),
  })) as StockMove[];
};

export const getStockMoves = async (): Promise<StockMove[]> => {
  const q = query(stockMovesCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    moveDate: doc.data().moveDate.toDate(), // Convert Firestore Timestamp to Date object
  })) as StockMove[];
};

import { getDoc } from 'firebase/firestore';

export const updateStockMove = async (id: string, stockMove: Partial<Omit<StockMove, 'id' | 'createdAt' | 'itemName'>>): Promise<void> => {
  const stockMoveDocRef = doc(db, 'stockMoves', id);
  const stockMoveSnap = await getDoc(stockMoveDocRef);

  if (!stockMoveSnap.exists()) {
    throw new Error('Stock move not found');
  }

  const existingStockMove = stockMoveSnap.data() as StockMove;

  let updatedItemName = existingStockMove.itemName;
  if (stockMove.itemId && stockMove.itemId !== existingStockMove.itemId) {
    const newItem = await getItemById(stockMove.itemId);
    if (newItem) {
      updatedItemName = newItem.name;
    }
  }

  const updatedData: Partial<StockMove> = {
    ...stockMove,
    itemName: updatedItemName,
  };

  if (stockMove.moveDate) {
    updatedData.moveDate = new Date(stockMove.moveDate);
  }

  await updateDoc(stockMoveDocRef, updatedData);
};

export const deleteStockMove = async (id: string): Promise<void> => {
  const stockMoveDocRef = doc(db, 'stockMoves', id);
  const stockMoveSnap = await getDoc(stockMoveDocRef);

  if (!stockMoveSnap.exists()) {
    throw new Error('Stock move not found');
  }

  const stockMoveToDelete = stockMoveSnap.data() as StockMove;

  // Revert item quantity
  const item = await getItemById(stockMoveToDelete.itemId);
  if (item) {
    await updateItem(item.id!, { quantity: item.quantity + stockMoveToDelete.quantity });
  }

  await deleteDoc(stockMoveDocRef);
};

export const getStockMoveTrend = async (): Promise<{ date: string; count: number }[]> => {
  const stockMoves = await getStockMoves();
  const trend = stockMoves.reduce((acc, move) => {
    const date = move.moveDate.toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count += move.quantity;
    } else {
      acc.push({ date, count: move.quantity });
    }
    return acc;
  }, [] as { date: string; count: number }[]);
  return trend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getStockMoveTrendByItemId = async (itemId: string): Promise<{ date: string; count: number }[]> => {
  const stockMoves = await getStockMovesByItemId(itemId);
  const trend = stockMoves.reduce((acc, move) => {
    const date = move.moveDate.toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count += move.quantity;
    } else {
      acc.push({ date, count: move.quantity });
    }
    return acc;
  }, [] as { date: string; count: number }[]);
  return trend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getFrequentItems = async (): Promise<{ name: string; moves: number }[]> => {
  const stockMoves = await getStockMoves();
  const frequentItems = stockMoves.reduce((acc, move) => {
    const existing = acc.find(i => i.name === move.itemName);
    if (existing) {
      existing.moves += move.quantity;
    } else {
      acc.push({ name: move.itemName, moves: move.quantity });
    }
    return acc;
  }, [] as { name: string; moves: number }[]);

  return frequentItems.sort((a, b) => b.moves - a.moves).slice(0, 5);
};

