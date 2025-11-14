import type { Timestamp } from 'firebase/firestore';

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Activity = {
  id: string;
  description: string;
  categoryId: string;
  tags: string[];
  startTime: Timestamp | Date;
  endTime: Timestamp | Date;
  duration: number; // in seconds
};

export type Goal = {
  id: string;
  categoryId: string;
  targetHours: number;
  name: string;
};

export type EnergyLog = {
  date: Date;
  level: 1 | 2 | 3 | 4 | 5;
  motivation: 1 | 2 | 3 | 4 | 5;
};

export type StatsData = {
  timeByCategory: { name: string; value: number; fill: string }[];
  productivityTrend: { date: string; Productive: number; 'Low Quality': number }[];
  categoryDistribution: { name: string; value: number; fill: string }[];
};