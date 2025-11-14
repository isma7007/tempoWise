"use client"

import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import type { Activity, Category } from "@/lib/types"

export function StatsDashboard() {
  const { firestore, user } = useFirebase();

  const activitiesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'activities');
  }, [user, firestore]);
  const { data: activities, isLoading: activitiesLoading } = useCollection<Activity>(activitiesRef);

  const categoriesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesRef);

  const processStats = (period: 'day' | 'week' | 'month') => {
    if (!activities || !categories) {
      return {
        timeByCategory: [],
        productivityTrend: [],
        categoryDistribution: [],
      };
    }
    
    const categoriesMap = new Map(categories.map(c => [c.id, c]));
    const now = new Date();
    const periodStart = new Date();

    if (period === 'day') {
      periodStart.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      periodStart.setDate(now.getDate() - now.getDay());
      periodStart.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
    }
    
    const filteredActivities = activities.filter(a => {
        const activityDate = a.startTime instanceof Date ? a.startTime : a.startTime.toDate();
        return activityDate >= periodStart;
    });

    const timeByCategory = categories.map(category => {
      const totalDuration = filteredActivities
        .filter(a => a.categoryId === category.id)
        .reduce((acc, a) => acc + a.duration, 0);
      return {
        name: category.name,
        value: Math.round(totalDuration / 3600), // hours
        fill: category.color,
      };
    });

    const categoryDistribution = timeByCategory.filter(c => c.value > 0);

    return {
      timeByCategory,
      productivityTrend: [], // This would require more complex logic to determine productive vs low quality
      categoryDistribution
    };
  };

  const renderCharts = (period: 'day' | 'week' | 'month') => {
    const data = processStats(period);
    const isLoading = activitiesLoading || categoriesLoading;

    if (isLoading) {
      return <p>Loading stats...</p>;
    }
    
    return (
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Time per Category</CardTitle>
            <CardDescription>Hours spent on each category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.timeByCategory}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip cursor={{fill: 'hsla(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.timeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
            <CardDescription>Comparison of productive vs. low-quality time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.productivityTrend}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} />
                <Legend />
                <Line type="monotone" dataKey="Productive" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                <Line type="monotone" dataKey="Low Quality" stroke="hsl(var(--chart-5))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Percentage of time spent in each category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                   {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Tabs defaultValue="week" className="space-y-4">
      <TabsList>
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
      <TabsContent value="day" className="space-y-4">
        {renderCharts('day')}
      </TabsContent>
      <TabsContent value="week" className="space-y-4">
        {renderCharts('week')}
      </TabsContent>
      <TabsContent value="month" className="space-y-4">
        {renderCharts('month')}
      </TabsContent>
    </Tabs>
  )
}