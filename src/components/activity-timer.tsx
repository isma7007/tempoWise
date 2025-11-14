'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Pause, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AITagSuggester } from './ai-tag-suggester';
import { useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addActivity } from '@/app/data/operations';
import type { Category } from '@/lib/types';
import { useFocusMode } from '@/context/focus-mode-context';
import { cn } from '@/lib/utils';
import { AudioPlayer } from './audio-player';

const DURATION_OPTIONS = [
  { value: 0, label: 'No limit' },
  { value: 15 * 60, label: '15 minutes' },
  { value: 30 * 60, label: '30 minutes' },
  { value: 45 * 60, label: '45 minutes' },
  { value: 60 * 60, label: '1 hour' },
];

const NOTIFICATION_INTERVAL = 30 * 60; // 30 minutes in seconds

export function ActivityTimer() {
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [tags, setTags] = useState<string[]>([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [targetDuration, setTargetDuration] = useState(0);

  const [playCompletionSound, setPlayCompletionSound] = useState(false);
  const [playIntervalSound, setPlayIntervalSound] = useState(false);

  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { isFocusMode, setIsFocusMode } = useFocusMode();

  const categoriesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);
  const { data: categories } = useCollection<Category>(categoriesRef);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStop = useCallback(async (finalTime?: number) => {
    const duration = finalTime ?? time;
    if (!firestore || !user || !startTime || !selectedCategory || duration === 0)
      return;

    setIsFocusMode(false);

    try {
      await addActivity(firestore, user.uid, {
        description,
        categoryId: selectedCategory,
        tags,
        startTime,
        endTime: new Date(),
        duration: duration,
      });

      toast({
        title: 'Activity Logged',
        description: `Logged "${description}" for ${formatTime(duration)}.`,
      });

      // Reset state
      setIsRunning(false);
      setTime(0);
      setStartTime(null);
      setDescription('');
      setSelectedCategory(undefined);
      setTags([]);
      setTargetDuration(0);
    } catch (error) {
      toast({
        title: 'Error Logging Activity',
        description: 'Could not save the activity. Please try again.',
        variant: 'destructive',
      });
    }
  }, [time, firestore, user, startTime, selectedCategory, description, tags, setIsFocusMode, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;

          // Check for 30-minute interval notification
          if (newTime % NOTIFICATION_INTERVAL === 0 && newTime > 0) {
            setPlayIntervalSound(true);
          }

          // Check if target duration is reached
          if (targetDuration > 0 && newTime >= targetDuration) {
            handleStop(newTime);
            setPlayCompletionSound(true);
            return prevTime; // Prevent time from exceeding target
          }

          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, targetDuration, handleStop]);

  const handleStartPause = () => {
    if (!description || !selectedCategory) {
      toast({
        title: 'Incomplete Information',
        description: 'Please enter a description and select a category.',
        variant: 'destructive',
      });
      return;
    }
    if (!isRunning) {
      setStartTime(new Date());
      setIsFocusMode(true);
    }
    setIsRunning(!isRunning);
  };

  const onTagsSuggested = useCallback((suggestedTags: string[]) => {
    setTags((prevTags) => [...new Set([...prevTags, ...suggestedTags])]);
  }, []);

  const timerContent = (
    <div
      className={cn(
        'space-y-4 transition-all duration-300',
        isFocusMode &&
          'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'
      )}
    >
      <div
        className={cn(
          'grid grid-cols-1 gap-4 md:grid-cols-3',
          isFocusMode && 'hidden'
        )}
      >
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isRunning}
          className="md:col-span-2"
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
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3', isFocusMode && 'hidden')}>
        <div className="md:col-span-2">
            <AITagSuggester
              description={description}
              onTagsSuggested={onTagsSuggested}
            />
        </div>
         <Select
          value={String(targetDuration)}
          onValueChange={(value) => setTargetDuration(Number(value))}
          disabled={isRunning}
        >
          <SelectTrigger>
            <SelectValue placeholder="Set a duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn('flex flex-wrap gap-2', isFocusMode && 'hidden')}>
        {tags.map((tag, index) => (
          <span
            key={index}
            className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div
        className={cn(
          'flex items-center justify-between rounded-lg bg-muted p-4',
          isFocusMode && 'h-64 w-96 flex-col justify-center gap-6'
        )}
      >
        <div
          className={cn(
            'font-mono text-3xl font-bold text-foreground',
            isFocusMode && 'text-7xl'
          )}
        >
          {formatTime(time)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleStartPause}
            className={cn(isFocusMode && 'h-16 w-16 rounded-full')}
          >
            {isRunning ? (
              <Pause
                className={cn('h-5 w-5', isFocusMode && 'h-8 w-8')}
              />
            ) : (
              <Play className={cn('h-5 w-5', isFocusMode && 'h-8 w-8')} />
            )}
            <span className="sr-only">{isRunning ? 'Pause' : 'Start'}</span>
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => handleStop()}
            disabled={!isRunning && time === 0}
            className={cn(isFocusMode && 'h-16 w-16 rounded-full')}
          >
            <Square className={cn('h-5 w-5', isFocusMode && 'h-8 w-8')} />
            <span className="sr-only">Stop</span>
          </Button>
        </div>
      </div>
      <AudioPlayer
        isPlaying={playCompletionSound}
        onFinished={() => setPlayCompletionSound(false)}
        type="completion"
      />
      <AudioPlayer
        isPlaying={playIntervalSound}
        onFinished={() => setPlayIntervalSound(false)}
        type="interval"
      />
    </div>
  );

  if (isFocusMode) {
    return ReactDOM.createPortal(timerContent, document.body);
  }

  return timerContent;
}
