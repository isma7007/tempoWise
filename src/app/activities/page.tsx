import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTable } from "@/components/activity-table";
import { activities } from "@/lib/data";

export default function ActivitiesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>A detailed history of your tracked activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityTable activities={activities} />
      </CardContent>
    </Card>
  );
}
