"use client"

import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { stats } from "@/lib/data"
import type { StatsData } from "@/lib/types"

export function StatsDashboard() {

  const renderCharts = (data: StatsData) => (
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
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
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

  return (
    <Tabs defaultValue="week" className="space-y-4">
      <TabsList>
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
      <TabsContent value="day" className="space-y-4">
        {renderCharts(stats.day)}
      </TabsContent>
      <TabsContent value="week" className="space-y-4">
        {renderCharts(stats.week)}
      </TabsContent>
      <TabsContent value="month" className="space-y-4">
        {renderCharts(stats.month)}
      </TabsContent>
    </Tabs>
  )
}
