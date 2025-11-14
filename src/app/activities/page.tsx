'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTable } from "@/components/activity-table";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function ActivitiesPage() {
  const { firestore, user } = useFirebase();
  const activitiesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'activities');
  }, [user, firestore]);
  const { data: activities, isLoading } = useCollection(activitiesRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>A detailed history of your tracked activities.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading activities...</p>}
        {activities && <ActivityTable activities={activities as any[]} />}
      </CardContent>
    </Card>
  );
}
