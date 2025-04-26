import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { activeLLMConfigAtom, activeLLMProviderAtom, LLMProvider, modelsAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button";

type LLMConfigSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LLMConfigSheet({
  open,
  onOpenChange,
}: LLMConfigSheetProps) {
  const [activeProvider, setActiveProvider] = useAtom(activeLLMProviderAtom);
  const [llmConfig, setLlmConfig] = useAtom(activeLLMConfigAtom);
  const [modelsPopoverOpen, setModelsPopoverOpen] = useState(false);
  const { data: models, error, isLoading } = useAtomValue(modelsAtom);

  useEffect(() => {
    if (error?.message) {
      toast.error("Error Occurred while fetching models", {
        description: error.message,
      });
    }
  }, [error?.message]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[540px] bg-dark-100 border-zinc-800"
      >
        <SheetHeader className="p-4">
          <SheetTitle className="text-4xl">LLM Settings</SheetTitle>
        </SheetHeader>
        <div className="px-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={activeProvider}
              onValueChange={(value) => setActiveProvider(value as LLMProvider)}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pollinations">
                  Pollinations (Free)
                </SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="openai-like">OpenAI Compatible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2 w-full">
            <Label htmlFor="model">Model</Label>
            {
              <div className="space-y-2 w-full">
                <Popover open={modelsPopoverOpen} onOpenChange={setModelsPopoverOpen}>
                  <PopoverTrigger asChild className="w-full" id="model">
                    <Button
                      variant="outline"
                      className={cn("w-full justify-between", {
                        "cursor-not-allowed animate-shine": isLoading,
                      })}
                      role="combobox"
                      aria-expanded={open}
                    >
                      {llmConfig.model && !error
                        ? models?.find((model) => model.id === llmConfig.model)
                            ?.id ?? llmConfig.model
                        : "Select Model..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    align="start"
                    className="w-full dark"
                  >
                    {error ? (
                      <div className="flex items-center justify-center w-full h-32">
                        <p className="text-sm text-muted-foreground">
                          {error.message}
                        </p>
                      </div>
                    ) : (
                      <Command className="dark">
                        <CommandInput placeholder="Search models..." />
                        <CommandList className="overflow-auto">
                          {models?.map((model) => (
                            <CommandItem
                              key={model.id}
                              value={model.id}
                              className="cursor-pointer"
                              onSelect={(value) => {
                                setLlmConfig({ model: value });
                                setModelsPopoverOpen(false);
                              }}
                            >
                              {model.name || model.id}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            }
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={llmConfig.apiKey}
              onChange={(e) => setLlmConfig({ apiKey: e.target.value })}
              disabled={activeProvider === "pollinations"}
              placeholder="Enter your API key"
            />
          </div>

          {/* Custom Endpoint (for custom provider) */}
          {llmConfig.provider === "openai-like" && (
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                value={llmConfig.endpoint || ""}
                disabled={activeProvider === "pollinations"}
                onChange={(e) => setLlmConfig({ endpoint: e.target.value })}
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>
          )}

          {/* Temperature */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="temperature">
                Temperature: {llmConfig.temperature}
              </Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[llmConfig.temperature]}
              onValueChange={(value) => setLlmConfig({ temperature: value[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
