"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
import { getProductivityInsights } from "@/app/actions";
import { activities } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

export function AIInsights() {
  const [insights, setInsights] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [energyLevel, setEnergyLevel] = useState("3");
  const [motivationLevel, setMotivationLevel] = useState("3");

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setInsights("");

    const activityLogs = JSON.stringify(activities.map(a => ({
      description: a.description,
      category: a.category.name,
      durationMinutes: a.duration / 60,
      startTime: a.startTime.toISOString(),
    })));

    const energyLevels = JSON.stringify([{
      date: new Date().toISOString().split('T')[0],
      energy: parseInt(energyLevel),
      motivation: parseInt(motivationLevel),
    }]);

    const result = await getProductivityInsights({ activityLogs, energyLevels });
    setInsights(result);
    setIsLoading(false);
  };
  
  const renderRatingGroup = (label: string, value: string, setValue: (value: string) => void) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RadioGroup value={value} onValueChange={setValue} className="flex">
        {[1, 2, 3, 4, 5].map(v => (
          <div key={v} className="flex items-center space-x-2">
            <RadioGroupItem value={String(v)} id={`${label}-${v}`} />
            <Label htmlFor={`${label}-${v}`}>{v}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Productivity Insights
        </CardTitle>
        <CardDescription>
          Log your energy and motivation, then generate insights based on your recent activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border">
            {renderRatingGroup("Energy Level", energyLevel, setEnergyLevel)}
            {renderRatingGroup("Motivation Level", motivationLevel, setMotivationLevel)}
            <Button onClick={handleGenerateInsights} disabled={isLoading} className="self-end">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                "Generate Insights"
              )}
            </Button>
        </div>

        {insights && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-foreground whitespace-pre-wrap">{insights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
