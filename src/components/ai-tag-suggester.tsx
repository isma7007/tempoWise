"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { getTagSuggestions } from "@/app/actions";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandGroup, CommandItem } from "./ui/command";

interface AITagSuggesterProps {
  description: string;
  onTagsSuggested: (tags: string[]) => void;
}

export function AITagSuggester({ description, onTagsSuggested }: AITagSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSuggestTags = async () => {
    if (!description) return;
    setIsLoading(true);
    setPopoverOpen(true);
    const result = await getTagSuggestions({ text: description });
    setSuggestions(result);
    setIsLoading(false);
  };

  const handleSelectTag = (tag: string) => {
    onTagsSuggested([tag]);
    setPopoverOpen(false);
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleSuggestTags} 
          disabled={!description || isLoading}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? "Suggesting..." : "Suggest Tags"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]" align="start">
        <Command>
          <CommandGroup heading="Suggestions">
            {isLoading ? (
              <div className="p-4 text-sm text-center">Loading...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((tag) => (
                <CommandItem key={tag} onSelect={() => handleSelectTag(tag)}>
                  {tag}
                </CommandItem>
              ))
            ) : (
              <div className="p-4 text-sm text-center">No suggestions found.</div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
