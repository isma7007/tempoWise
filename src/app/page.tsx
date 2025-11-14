import { ActivityTimer } from "@/components/activity-timer";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Zap } from "lucide-react";
import { AIInsights } from "@/components/ai-insights";
import { todaySummary } from "@/lib/data";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Tracker</CardTitle>
            <CardDescription>What are you working on?</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTimer />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Summary
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySummary.totalTime}</div>
              <p className="text-xs text-muted-foreground">
                {todaySummary.productiveTime} of productive time
              </p>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Focus Session
              </CardTitle>
               <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Use the Pomodoro technique to enhance your focus.</p>
              <PomodoroTimer />
            </CardContent>
          </Card>
        </div>
      </div>
      <AIInsights />
    </div>
  );
}
