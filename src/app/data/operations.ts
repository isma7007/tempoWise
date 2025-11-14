'use client';

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  Firestore,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Activity, Category, Goal } from '@/lib/types';

// Generic function to add a document and handle errors
async function addDocument<T>(
  db: Firestore,
  path: string,
  data: T
) {
  const colRef = collection(db, path);
  try {
    return await addDoc(colRef, data);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    );
    throw error;
  }
}

// Generic function to set a document and handle errors
async function setDocument<T>(db: Firestore, path: string, data: T) {
    const docRef = doc(db, path);
    try {
        await setDoc(docRef, data);
    } catch (error) {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: docRef.path,
                operation: 'write',
                requestResourceData: data,
            })
        );
        throw error;
    }
}

// Generic function to update a document and handle errors
async function updateDocument<T>(db: Firestore, path: string, data: Partial<T>) {
    const docRef = doc(db, path);
    try {
        await updateDoc(docRef, data);
    } catch (error) {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: data,
            })
        );
        throw error;
    }
}


// Generic function to delete a document and handle errors
async function deleteDocument(db: Firestore, path: string) {
  const docRef = doc(db, path);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      })
    );
    throw error;
  }
}

// --- Specific Operations ---

// Activities
export const addActivity = (
  db: Firestore,
  userId: string,
  activity: Omit<Activity, 'id' | 'startTime' | 'endTime'> & { startTime: Date, endTime: Date }
) => {
  const data = {
    ...activity,
    startTime: Timestamp.fromDate(activity.startTime),
    endTime: Timestamp.fromDate(activity.endTime as Date),
  };
  return addDocument(db, `users/${userId}/activities`, data);
};

export const deleteActivity = (
  db: Firestore,
  userId: string,
  activityId: string
) => {
  return deleteDocument(db, `users/${userId}/activities/${activityId}`);
};

// Categories
export const addCategory = (db: Firestore, userId: string, category: Omit<Category, 'id'>) => {
    return addDocument(db, `users/${userId}/categories`, category);
}

export const updateCategory = (db: Firestore, userId: string, categoryId: string, data: Partial<Omit<Category, 'id'>>) => {
    return updateDocument(db, `users/${userId}/categories/${categoryId}`, data);
}

export const deleteCategory = (db: Firestore, userId: string, categoryId: string) => {
    return deleteDocument(db, `users/${userId}/categories/${categoryId}`);
}

// Goals
export const addGoal = (
  db: Firestore,
  userId: string,
  goal: Omit<Goal, 'id'>
) => {
  return addDocument(db, `users/${userId}/weeklyGoals`, goal);
};

// Seed Data
export async function seedInitialData(userId: string, firestore: Firestore) {
  // 1. Create a user document to mark the user as 'seeded'
  const userDocRef = doc(firestore, 'users', userId);
  await setDoc(userDocRef, { seeded: true }, { merge: true }).catch((error) => {
     errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'write',
        requestResourceData: { seeded: true },
      })
    );
    throw error;
  });

  // 2. Seed categories
  const categories = [
    { name: 'Work', color: 'hsl(var(--chart-1))' },
    { name: 'Study', color: 'hsl(var(--chart-2))' },
    { name: 'Exercise', color: 'hsl(var(--chart-3))' },
    { name: 'Leisure', color: 'hsl(var(--chart-4))' },
    { name: 'Other', color: 'hsl(var(--chart-5))' },
  ];

  const categoryPromises = categories.map((category) =>
    addDocument(firestore, `users/${userId}/categories`, category)
  );

  await Promise.all(categoryPromises);
}
