"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(WORK_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          setIsBreak(!isBreak);
          setMinutes(isBreak ? WORK_MINUTES : BREAK_MINUTES);
          // Simple notification for demo
          alert(isBreak ? "Time for a break!" : "Back to work!");
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, isBreak]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(WORK_MINUTES);
    setSeconds(0);
  };

  const totalSeconds = (isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60;
  const elapsedSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - elapsedSeconds) / totalSeconds) * 100;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Open Pomodoro</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pomodoro Timer</DialogTitle>
          <DialogDescription>
            {isBreak ? "You are on a break." : "Time to focus!"}
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
                        style={{transform: 'rotate(-90deg)', transformOrigin: '50% 50%'}}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold font-mono">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
            </div>
          
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
