"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Activity, Category, Goal } from "@/lib/types";
import { useState } from "react";
import { addGoal } from "@/app/data/operations";
import { useToast } from "@/hooks/use-toast";

export function GoalsList() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [targetHours, setTargetHours] = useState("");

    const goalsRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'weeklyGoals');
    }, [user, firestore]);
    const { data: goals, isLoading: goalsLoading } = useCollection<Goal>(goalsRef);
    
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

    const isLoading = goalsLoading || activitiesLoading || categoriesLoading;

    const getCategoryById = (id: string) => categories?.find(c => c.id === id);

    const calculateCurrentHours = (goal: Goal) => {
        if (!activities) return 0;
        const totalSeconds = activities
            .filter(a => a.categoryId === goal.categoryId)
            .reduce((acc, a) => acc + a.duration, 0);
        return totalSeconds / 3600;
    };

    const handleCreateGoal = async () => {
        if (!name || !categoryId || !targetHours || !firestore || !user) return;
        
        try {
            await addGoal(firestore, user.uid, {
                name,
                categoryId,
                targetHours: Number(targetHours),
            });
            
            toast({ title: "Goal Created", description: `Your new goal "${name}" has been set.` });
            setName("");
            setCategoryId("");
            setTargetHours("");
            setOpen(false);
        } catch (error) {
            toast({ title: "Error", description: "Could not create the goal.", variant: "destructive" });
        }
    }
    
    return (
      <>
        {isLoading && <p>Loading goals...</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals?.map((goal) => {
                const currentHours = calculateCurrentHours(goal);
                const progress = (currentHours / goal.targetHours) * 100;
                const category = getCategoryById(goal.categoryId);
                return (
                    <Card key={goal.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {category && <span className="w-2 h-2 rounded-full" style={{backgroundColor: category.color}} />}
                                {goal.name}
                            </CardTitle>
                            <CardDescription>Target: {goal.targetHours} hours this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Progress value={progress} />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{currentHours.toFixed(1)}h logged</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="h-full min-h-[180px] border-dashed flex-col gap-2">
                        <PlusCircle className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground">Add New Goal</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Goal</DialogTitle>
                        <DialogDescription>Set a target for one of your categories.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" placeholder="e.g., Study for exams" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                             <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="hours" className="text-right">Target (hours)</Label>
                            <Input id="hours" type="number" placeholder="10" className="col-span-3" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleCreateGoal}>Create Goal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        
      </>
    )
}
