import type { Goal, StatsData } from "./types";
import { addDocumentNonBlocking, useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export const goals: Goal[] = [];

export const stats: { day: StatsData, week: StatsData, month: StatsData } = {
  day: {
    timeByCategory: [],
    productivityTrend: [],
    categoryDistribution: [],
  },
  week: {
    timeByCategory: [],
     productivityTrend: [],
    categoryDistribution: [],
  },
  month: {
    timeByCategory: [],
    productivityTrend: [],
    categoryDistribution: [],
  },
};

export const todaySummary = {
    totalTime: "0h 0m",
    productiveTime: "0h 0m",
}

export function seedInitialData(userId: string, firestore: any) {
  const categories = [
    { name: "Work", color: "hsl(var(--chart-1))" },
    { name: "Study", color: "hsl(var(--chart-2))" },
    { name: "Exercise", color: "hsl(var(--chart-3))" },
    { name: "Leisure", color: "hsl(var(--chart-4))" },
    { name: "Other", color: "hsl(var(--chart-5))" },
  ];

  const categoriesCollection = collection(firestore, 'users', userId, 'categories');
  categories.forEach(category => {
    addDocumentNonBlocking(categoriesCollection, category);
  });
}