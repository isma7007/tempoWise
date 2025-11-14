"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pause, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AITagSuggester } from './ai-tag-suggester';
import { useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addActivity } from '@/app/data/operations';
import type { Category } from '@/lib/types';


export function ActivityTimer() {
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const categoriesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);
  const { data: categories } = useCollection<Category>(categoriesRef);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    if (!description || !selectedCategory) {
      toast({
        title: "Incomplete Information",
        description: "Please enter a description and select a category.",
        variant: "destructive",
      });
      return;
    }
    if (!isRunning) {
      setStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };
  
  const handleStop = async () => {
    if (!firestore || !user || !startTime || !selectedCategory) return;

    try {
      await addActivity(firestore, user.uid, {
        description,
        categoryId: selectedCategory,
        tags,
        startTime,
        endTime: new Date(),
        duration: time,
      });

      toast({
        title: "Activity Logged",
        description: `Logged "${description}" for ${formatTime(time)}.`,
      });

      setIsRunning(false);
      setTime(0);
      setStartTime(null);
      setDescription('');
      setSelectedCategory(undefined);
      setTags([]);
    } catch (error) {
       toast({
        title: "Error Logging Activity",
        description: "Could not save the activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onTagsSuggested = useCallback((suggestedTags: string[]) => {
    setTags(prevTags => [...new Set([...prevTags, ...suggestedTags])]);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          placeholder="What are you working on?" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isRunning}
        />
        <Select 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            disabled={isRunning}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}} />
                    {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AITagSuggester description={description} onTagsSuggested={onTagsSuggested} />
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
        <div className="font-mono text-3xl font-bold text-foreground">
          {formatTime(time)}
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={handleStartPause}>
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span className="sr-only">{isRunning ? 'Pause' : 'Start'}</span>
          </Button>
          <Button size="icon" variant="destructive" onClick={handleStop} disabled={!isRunning && time === 0}>
            <Square className="h-5 w-5" />
            <span className="sr-only">Stop</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
