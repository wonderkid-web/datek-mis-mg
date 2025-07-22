import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { User } from './types';

const usersCollectionRef = collection(db, 'users');

export const createUser = async (user: Omit<User, 'id' | 'createdAt'>): Promise<string> => {
  const newUser = {
    ...user,
    createdAt: new Date(),
  };
  const docRef = await addDoc(usersCollectionRef, newUser);
  return docRef.id;
};

export const getUsers = async (): Promise<User[]> => {
  const q = query(usersCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as User[];
};

export const updateUser = async (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> => {
  const userDocRef = doc(db, 'users', id);
  await updateDoc(userDocRef, user);
};

export const deleteUser = async (id: string): Promise<void> => {
  const userDocRef = doc(db, 'users', id);
  await deleteDoc(userDocRef);
};
