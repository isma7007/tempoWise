"use server";

import { generateInsights, ActivityDataInput } from "@/ai/flows/generate-insights-from-activity-data";
import { suggestTagsFromInput, SuggestTagsFromInputType } from "@/ai/flows/suggest-tags-from-input";

export async function getTagSuggestions(input: SuggestTagsFromInputType): Promise<string[]> {
  try {
    const result = await suggestTagsFromInput(input);
    return result.tags || [];
  } catch (error) {
    console.error("Error fetching tag suggestions:", error);
    return [];
  }
}

export async function getProductivityInsights(input: ActivityDataInput): Promise<string> {
  try {
    const result = await generateInsights(input);
    return result.insights || "No insights could be generated at this time.";
  } catch (error) {
    console.error("Error fetching productivity insights:", error);
    return "Failed to generate insights due to an error.";
  }
}
