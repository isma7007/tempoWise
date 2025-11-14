'use server';

/**
 * @fileOverview This flow suggests relevant tags based on the user's input text.
 *
 * - suggestTagsFromInput - A function that takes user input and returns tag suggestions.
 * - SuggestTagsFromInputType - The input type for the suggestTagsFromInput function.
 * - SuggestTagsFromOutputType - The return type for the suggestTagsFromInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsFromInputSchema = z.object({
  text: z.string().describe('The user input text to generate tag suggestions for.'),
});
export type SuggestTagsFromInputType = z.infer<typeof SuggestTagsFromInputSchema>;

const SuggestTagsFromOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags based on the input text.'),
});
export type SuggestTagsFromOutputType = z.infer<typeof SuggestTagsFromOutputSchema>;

export async function suggestTagsFromInput(input: SuggestTagsFromInputType): Promise<SuggestTagsFromOutputType> {
  return suggestTagsFromInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsFromInputSchema},
  output: {schema: SuggestTagsFromOutputSchema},
  prompt: `Suggest relevant tags for the following text. The tags should be short, descriptive, and relevant to the content of the text. Return a JSON array of strings.

Text: {{{text}}}`,
});

const suggestTagsFromInputFlow = ai.defineFlow(
  {
    name: 'suggestTagsFromInputFlow',
    inputSchema: SuggestTagsFromInputSchema,
    outputSchema: SuggestTagsFromOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
