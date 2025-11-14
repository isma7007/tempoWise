import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Activity, Category } from "@/lib/types";
import { useFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

interface ActivityTableProps {
  activities: (Activity & { id: string; category?: Category })[];
}

export function ActivityTable({ activities }: ActivityTableProps) {
  const { firestore, user } = useFirebase();

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  const handleDelete = (activityId: string) => {
    if (!firestore || !user) return;
    const activityRef = doc(firestore, 'users', user.uid, 'activities', activityId);
    deleteDocumentNonBlocking(activityRef);
  };

  const getFirebaseTimestamp = (date: any) => {
    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }
    return new Date(date);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="hidden md:table-cell">Tags</TableHead>
          <TableHead className="hidden md:table-cell">Duration</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className="font-medium">{activity.description}</TableCell>
            <TableCell>
              {activity.category ? (
                <Badge variant="outline" style={{ borderLeft: `3px solid ${activity.category.color}` }}>
                  {activity.category.name}
                </Badge>
              ) : (
                <Badge variant="secondary">Uncategorized</Badge>
              )}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex gap-1 flex-wrap">
                {activity.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{formatDuration(activity.duration)}</TableCell>
            <TableCell className="hidden sm:table-cell">{getFirebaseTimestamp(activity.startTime).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(activity.id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}