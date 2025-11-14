'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTable } from "@/components/activity-table";
import { useCollection, useFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function ActivitiesPage() {
  const { firestore, user } = useFirebase();
  const activitiesRef = user ? collection(firestore, 'users', user.uid, 'activities') : null;
  const { data: activities, isLoading } = useCollection(activitiesRef as any);

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
