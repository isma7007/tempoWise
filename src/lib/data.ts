import type { Category, Activity, Goal, StatsData } from "./types";

export const categories: Category[] = [
  { id: "1", name: "Work", color: "hsl(var(--chart-1))" },
  { id: "2", name: "Study", color: "hsl(var(--chart-2))" },
  { id: "3", name: "Exercise", color: "hsl(var(--chart-3))" },
  { id: "4", name: "Leisure", color: "hsl(var(--chart-4))" },
  { id: "5", name: "Other", color: "hsl(var(--chart-5))" },
];

export const activities: Activity[] = [];

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
