'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { addActivity } from '@/app/data/operations';
import type { Category } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(WORK_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const categoriesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);
  const { data: categories } = useCollection<Category>(categoriesRef);

  const handleSaveActivity = async () => {
    if (!firestore || !user || !selectedCategory || !sessionStartTime) return;

    try {
      await addActivity(firestore, user.uid, {
        description: 'Pomodoro Session',
        categoryId: selectedCategory,
        tags: ['pomodoro', 'focus'],
        startTime: sessionStartTime,
        endTime: new Date(),
        duration: WORK_MINUTES * 60,
      });
      toast({
        title: 'Activity Logged',
        description: `Logged a ${WORK_MINUTES}-minute Pomodoro session.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not log Pomodoro session.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          // Timer finished
          if (!isBreak) {
            // Work session finished, log it and start break
            handleSaveActivity();
            alert('Time for a break!');
            setIsBreak(true);
            setMinutes(BREAK_MINUTES);
          } else {
            // Break finished, start new work session
            alert('Back to work!');
            setIsBreak(false);
            setMinutes(WORK_MINUTES);
            setSelectedCategory(null); // Reset category for new session
          }
          setIsActive(false); // Pause timer
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, isBreak]);

  const toggle = () => {
    if (!selectedCategory && !isActive && !isBreak) {
      toast({
        title: 'Select a Category',
        description: 'Please select a category before starting the timer.',
        variant: 'destructive',
      });
      return;
    }
    if (!isActive) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(WORK_MINUTES);
    setSeconds(0);
    setSelectedCategory(null);
  };

  const totalSeconds = (isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60;
  const elapsedSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - elapsedSeconds) / totalSeconds) * 100;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Open Pomodoro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pomodoro Timer</DialogTitle>
          <DialogDescription>
            {isBreak ? 'You are on a break.' : 'Time to focus!'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-muted"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className="text-accent-foreground"
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 - (progress / 100) * 264}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {!isBreak && (
            <div className="w-full space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory || ''}
                onValueChange={setSelectedCategory}
                disabled={isActive}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <Button size="icon" onClick={toggle}>
              {isActive ? <Pause /> : <Play />}
            </Button>
            <Button size="icon" variant="outline" onClick={reset}>
              <RefreshCw />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
