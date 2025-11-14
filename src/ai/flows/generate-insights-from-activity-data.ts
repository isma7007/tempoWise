'use server';
/**
 * @fileOverview Generates personalized insights from user activity data.
 *
 * This file defines a Genkit flow that analyzes logged activities and provides recommendations
 * for optimizing time management and improving overall efficiency.
 *
 * @Exported Members:
 *   - `generateInsights`: A function that triggers the insight generation flow.
 *   - `ActivityDataInput`: The input type for the `generateInsights` function.
 *   - `ActivityInsightsOutput`: The output type for the `generateInsights` function, 
 *     containing the generated insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActivityDataInputSchema = z.object({
  activityLogs: z.string().describe('JSON string of activity logs with timestamps, categories, and optional tags.'),
  energyLevels: z.string().describe('JSON string of daily energy levels rated from 1 to 5.'),
});
export type ActivityDataInput = z.infer<typeof ActivityDataInputSchema>;

const ActivityInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights and recommendations for optimizing time management.'),
});
export type ActivityInsightsOutput = z.infer<typeof ActivityInsightsOutputSchema>;

export async function generateInsights(input: ActivityDataInput): Promise<ActivityInsightsOutput> {
  return generateInsightsFlow(input);
}

const insightsPrompt = ai.definePrompt({
  name: 'insightsPrompt',
  input: {schema: ActivityDataInputSchema},
  output: {schema: ActivityInsightsOutputSchema},
  prompt: `You are an AI productivity assistant. Analyze the user's activity logs and energy levels to provide personalized insights and recommendations for optimizing their time management and improving overall efficiency.

Activity Logs: {{{activityLogs}}}
Energy Levels: {{{energyLevels}}}

Provide insights such as identifying peak productivity times, recommending adjustments to their schedule, and suggesting activities that align with their energy levels.`,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: ActivityDataInputSchema,
    outputSchema: ActivityInsightsOutputSchema,
  },
  async input => {
    const {output} = await insightsPrompt(input);
    return output!;
  }
);
