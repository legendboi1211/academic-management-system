'use client';

import { app } from './firebase';

// Lazy load all Firestore functions
export const getFirestore = async () => {
  const { getFirestore: _getFirestore } = await import('firebase/firestore');
  return _getFirestore(app);
};

export const collection = async (db: any, ...args: any[]) => {
  const { collection: _collection } = await import('firebase/firestore');
  return _collection(db, ...args);
};

export const query = async (reference: any, ...args: any[]) => {
  const { query: _query } = await import('firebase/firestore');
  return _query(reference, ...args);
};

export const onSnapshot = async (q: any, callback: any) => {
  const { onSnapshot: _onSnapshot } = await import('firebase/firestore');
  return _onSnapshot(q, callback);
};

export const addDoc = async (collectionRef: any, data: any) => {
  const { addDoc: _addDoc } = await import('firebase/firestore');
  return _addDoc(collectionRef, data);
};

export const updateDoc = async (reference: any, data: any) => {
  const { updateDoc: _updateDoc } = await import('firebase/firestore');
  return _updateDoc(reference, data);
};

export const deleteDoc = async (reference: any) => {
  const { deleteDoc: _deleteDoc } = await import('firebase/firestore');
  return _deleteDoc(reference);
};

export const doc = async (db: any, ...args: any[]) => {
  const { doc: _doc } = await import('firebase/firestore');
  return _doc(db, ...args);
};

export const serverTimestamp = async () => {
  const { serverTimestamp: _serverTimestamp } = await import('firebase/firestore');
  return _serverTimestamp();
};

export const orderBy = async (...args: any[]) => {
  const { orderBy: _orderBy } = await import('firebase/firestore');
  return _orderBy(...args);
};
