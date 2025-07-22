import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Department } from './types';

const departmentsCollectionRef = collection(db, 'departments');

export const createDepartment = async (department: Omit<Department, 'id' | 'createdAt'>): Promise<string> => {
  const newDepartment = {
    ...department,
    createdAt: new Date(),
  };
  const docRef = await addDoc(departmentsCollectionRef, newDepartment);
  return docRef.id;
};

export const getDepartments = async (): Promise<Department[]> => {
  const q = query(departmentsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Department[];
};

export const updateDepartment = async (id: string, department: Partial<Omit<Department, 'id' | 'createdAt'>>): Promise<void> => {
  const departmentDocRef = doc(db, 'departments', id);
  await updateDoc(departmentDocRef, department);
};

export const deleteDepartment = async (id: string): Promise<void> => {
  const departmentDocRef = doc(db, 'departments', id);
  await deleteDoc(departmentDocRef);
};
