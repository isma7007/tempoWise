"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { goals, categories } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function GoalsList() {
    return (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
                const progress = (goal.currentHours / goal.targetHours) * 100;
                return (
                    <Card key={goal.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{backgroundColor: goal.category.color}} />
                                {goal.name}
                            </CardTitle>
                            <CardDescription>Target: {goal.targetHours} hours this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Progress value={progress} />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{goal.currentHours}h logged</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
             <Dialog>
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
                            <Input id="name" placeholder="e.g., Study for exams" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                             <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="hours" className="text-right">Target (hours)</Label>
                            <Input id="hours" type="number" placeholder="10" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Goal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        
      </>
    )
}
