'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTable } from "@/components/activity-table";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Activity, Category } from "@/lib/types";

export default function ActivitiesPage() {
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

  const activitiesWithCategories = useMemoFirebase(() => {
    if (!activities || !categories) return [];
    const categoriesMap = new Map(categories.map(c => [c.id, c]));
    return activities.map(activity => ({
      ...activity,
      category: categoriesMap.get(activity.categoryId),
    }));
  }, [activities, categories]);

  const isLoading = activitiesLoading || categoriesLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>A detailed history of your tracked activities.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading activities...</p>}
        {activitiesWithCategories && <ActivityTable activities={activitiesWithCategories as any[]} />}
      </CardContent>
    </Card>
  );
}