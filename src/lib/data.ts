import type { Category, Activity, Goal, StatsData } from "./types";

export const categories: Category[] = [
  { id: "1", name: "Work", color: "hsl(var(--chart-1))" },
  { id: "2", name: "Study", color: "hsl(var(--chart-2))" },
  { id: "3", name: "Exercise", color: "hsl(var(--chart-3))" },
  { id: "4", name: "Leisure", color: "hsl(var(--chart-4))" },
  { id: "5", name: "Other", color: "hsl(var(--chart-5))" },
];

export const activities: Activity[] = [
  {
    id: "1",
    description: "Developed new feature for project X",
    category: categories[0],
    tags: ["coding", "project-x"],
    startTime: new Date("2024-07-21T09:00:00"),
    endTime: new Date("2024-07-21T11:30:00"),
    duration: 9000,
  },
  {
    id: "2",
    description: "Morning run",
    category: categories[2],
    tags: ["running", "cardio"],
    startTime: new Date("2024-07-21T07:00:00"),
    endTime: new Date("2024-07-21T07:45:00"),
    duration: 2700,
  },
  {
    id: "3",
    description: "Read chapter 5 of 'Clean Architecture'",
    category: categories[1],
    tags: ["reading", "software-dev"],
    startTime: new Date("2024-07-21T13:00:00"),
    endTime: new Date("2024-07-21T14:00:00"),
    duration: 3600,
  },
  {
    id: "4",
    description: "Team meeting and planning",
    category: categories[0],
    tags: ["meeting", "planning"],
    startTime: new Date("2024-07-20T10:00:00"),
    endTime: new Date("2024-07-20T11:00:00"),
    duration: 3600,
  },
    {
    id: "5",
    description: "Watched a movie",
    category: categories[3],
    tags: ["movie", "relax"],
    startTime: new Date("2024-07-20T20:00:00"),
    endTime: new Date("2024-07-20T22:00:00"),
    duration: 7200,
  },
];

export const goals: Goal[] = [
    {
      id: "1",
      name: "Dedicate time to coding",
      category: categories[0],
      targetHours: 20,
      currentHours: 12.5,
    },
    {
      id: "2",
      name: "Improve technical knowledge",
      category: categories[1],
      targetHours: 10,
      currentHours: 8,
    },
    {
      id: "3",
      name: "Stay active",
      category: categories[2],
      targetHours: 5,
      currentHours: 3.5,
    },
];

export const stats: { day: StatsData, week: StatsData, month: StatsData } = {
  day: {
    timeByCategory: [
      { name: "Work", value: 4.5, fill: categories[0].color },
      { name: "Study", value: 2, fill: categories[1].color },
      { name: "Exercise", value: 1, fill: categories[2].color },
      { name: "Leisure", value: 1.5, fill: categories[3].color },
    ],
    productivityTrend: [
      { date: "00:00", Productive: 0, "Low Quality": 0 },
      { date: "04:00", Productive: 0, "Low Quality": 0.5 },
      { date: "08:00", Productive: 2, "Low Quality": 0 },
      { date: "12:00", Productive: 3, "Low Quality": 0 },
      { date: "16:00", Productive: 1.5, "Low Quality": 1 },
      { date: "20:00", Productive: 0, "Low Quality": 2 },
    ],
    categoryDistribution: [
      { name: "Work", value: 45, fill: categories[0].color },
      { name: "Study", value: 20, fill: categories[1].color },
      { name: "Exercise", value: 10, fill: categories[2].color },
      { name: "Leisure", value: 15, fill: categories[3].color },
      { name: "Other", value: 10, fill: categories[4].color },
    ],
  },
  week: {
    timeByCategory: [
      { name: "Work", value: 25, fill: categories[0].color },
      { name: "Study", value: 10, fill: categories[1].color },
      { name: "Exercise", value: 5, fill: categories[2].color },
      { name: "Leisure", value: 8, fill: categories[3].color },
    ],
     productivityTrend: [
      { date: "Mon", Productive: 6, "Low Quality": 2 },
      { date: "Tue", Productive: 7, "Low Quality": 1.5 },
      { date: "Wed", Productive: 5, "Low Quality": 3 },
      { date: "Thu", Productive: 8, "Low Quality": 1 },
      { date: "Fri", Productive: 6, "Low Quality": 2.5 },
      { date: "Sat", Productive: 2, "Low Quality": 4 },
      { date: "Sun", Productive: 3, "Low Quality": 3 },
    ],
    categoryDistribution: [
      { name: "Work", value: 50, fill: categories[0].color },
      { name: "Study", value: 20, fill: categories[1].color },
      { name: "Exercise", value: 10, fill: categories[2].color },
      { name: "Leisure", value: 15, fill: categories[3].color },
      { name: "Other", value: 5, fill: categories[4].color },
    ],
  },
  month: {
    timeByCategory: [
      { name: "Work", value: 100, fill: categories[0].color },
      { name: "Study", value: 40, fill: categories[1].color },
      { name: "Exercise", value: 20, fill: categories[2].color },
      { name: "Leisure", value: 32, fill: categories[3].color },
    ],
    productivityTrend: [
      { date: "Week 1", Productive: 30, "Low Quality": 10 },
      { date: "Week 2", Productive: 35, "Low Quality": 8 },
      { date: "Week 3", Productive: 28, "Low Quality": 12 },
      { date: "Week 4", Productive: 40, "Low Quality": 7 },
    ],
    categoryDistribution: [
      { name: "Work", value: 52, fill: categories[0].color },
      { name: "Study", value: 21, fill: categories[1].color },
      { name: "Exercise", value: 11, fill: categories[2].color },
      { name: "Leisure", value: 12, fill: categories[3].color },
      { name: "Other", value: 4, fill: categories[4].color },
    ],
  },
};

export const todaySummary = {
    totalTime: "5h 45m",
    productiveTime: "4h 15m",
}
