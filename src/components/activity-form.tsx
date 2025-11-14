'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Activity, Category } from '@/lib/types';
import { addActivity, updateActivity } from '@/app/data/operations';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AITagSuggester } from './ai-tag-suggester';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  tags: z.array(z.string()).optional(),
  startDate: z.date({ required_error: 'A start date is required.' }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm).' }),
  endDate: z.date({ required_error: 'An end date is required.' }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm).' }),
}).refine(data => {
    const startDateTime = new Date(data.startDate);
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(data.endDate);
    const [endHours, endMinutes] = data.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);

    return endDateTime > startDateTime;
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

type ActivityFormValues = z.infer<typeof formSchema>;

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
}

export function ActivityForm({ open, onOpenChange, activity }: ActivityFormProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [descriptionForAISuggestion, setDescriptionForAISuggestion] = useState("");


  const categoriesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);
  const { data: categories } = useCollection<Category>(categoriesRef);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      categoryId: '',
      tags: [],
      startTime: '00:00',
      endTime: '00:00',
    },
  });

  const combineDateTime = (date: Date, time: string): Date => {
      const newDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
  }

  const getFirebaseTimestamp = (date: any): Date => {
    if (!date) return new Date();
    return date.toDate ? date.toDate() : new Date(date);
  }

  useEffect(() => {
    if (activity) {
      const startDate = getFirebaseTimestamp(activity.startTime);
      const endDate = getFirebaseTimestamp(activity.endTime);
      form.reset({
        description: activity.description,
        categoryId: activity.categoryId,
        tags: activity.tags || [],
        startDate: startDate,
        startTime: format(startDate, 'HH:mm'),
        endDate: endDate,
        endTime: format(endDate, 'HH:mm'),
      });
      setTags(activity.tags || []);
      setDescriptionForAISuggestion(activity.description);
    } else {
      form.reset({
        description: '',
        categoryId: '',
        tags: [],
        startDate: new Date(),
        startTime: format(new Date(), 'HH:mm'),
        endDate: new Date(),
        endTime: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'),
      });
      setTags([]);
      setDescriptionForAISuggestion("");
    }
  }, [activity, form]);

  const onTagsSuggested = (suggestedTags: string[]) => {
    const newTags = [...new Set([...tags, ...suggestedTags])];
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };


  async function onSubmit(data: ActivityFormValues) {
    if (!firestore || !user) return;

    setIsSubmitting(true);
    
    const startDateTime = combineDateTime(data.startDate, data.startTime);
    const endDateTime = combineDateTime(data.endDate, data.endTime);
    const duration = (endDateTime.getTime() - startDateTime.getTime()) / 1000;

    const activityData = {
        description: data.description,
        categoryId: data.categoryId,
        tags: tags,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: duration,
    };

    try {
      if (activity?.id) {
        await updateActivity(firestore, user.uid, activity.id, activityData);
        toast({ title: 'Activity Updated', description: 'Your activity has been successfully updated.' });
      } else {
        await addActivity(firestore, user.uid, activityData);
        toast({ title: 'Activity Added', description: 'Your activity has been successfully logged.' });
      }
      onOpenChange(false);
      form.reset();
      setTags([]);
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'There was a problem saving your activity.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{activity ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
              <DialogDescription>
                {activity ? 'Update the details of your tracked activity.' : 'Log a new activity to your timeline.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Worked on the project design" {...field} onChange={(e) => { field.onChange(e); setDescriptionForAISuggestion(e.target.value); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex items-center gap-2">
                     <AITagSuggester description={descriptionForAISuggestion} onTagsSuggested={onTagsSuggested} />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} &times;
                      </Badge>
                    ))}
                  </div>
              </FormItem>

               <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
               </div>
                <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
               </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {activity ? 'Save Changes' : 'Add Activity'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
