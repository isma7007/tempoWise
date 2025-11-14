'use client';

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Activity, Category, Goal } from '@/lib/types';

// Generic function to add a document and handle errors
function addDocument<T>(
  db: Firestore,
  path: string,
  data: T
) {
  const colRef = collection(db, path);
  return addDoc(colRef, data).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    );
    throw error;
  });
}

// Generic function to delete a document and handle errors
function deleteDocument(db: Firestore, path: string) {
  const docRef = doc(db, path);
  return deleteDoc(docRef).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      })
    );
    throw error;
  });
}

// --- Specific Operations ---

// Activities
export const addActivity = (
  db: Firestore,
  userId: string,
  activity: Omit<Activity, 'id' | 'startTime'> & { startTime: Date }
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
  await setDoc(userDocRef, { email: 'user-placeholder@example.com', createdAt: Timestamp.now() }, { merge: true }).catch((error) => {
     errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'write',
        requestResourceData: { email: 'user-placeholder@example.com' },
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
