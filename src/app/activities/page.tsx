'use client'

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTable } from "@/components/activity-table";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Activity, Category } from "@/lib/types";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ActivityForm } from "@/components/activity-form";
import { AppLayout } from "@/components/app-layout";

export default function ActivitiesPage() {
  const { firestore, user } = useFirebase();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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

  const activitiesWithCategories = useMemo(() => {
    if (!activities || !categories) return [];
    const categoriesMap = new Map(categories.map(c => [c.id, c]));
    return activities.map(activity => ({
      ...activity,
      category: categoriesMap.get(activity.categoryId),
    })).sort((a, b) => {
        const dateA = a.startTime?.toDate ? a.startTime.toDate() : new Date(0);
        const dateB = b.startTime?.toDate ? b.startTime.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
  }, [activities, categories]);

  const isLoading = activitiesLoading || categoriesLoading;

  return (
    <AppLayout>
      <ActivityForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>A detailed history of your tracked activities.</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading activities...</p>}
          {activitiesWithCategories && <ActivityTable activities={activitiesWithCategories as any[]} />}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
