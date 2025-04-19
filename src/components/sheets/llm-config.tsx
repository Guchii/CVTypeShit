import { useAtom } from "jotai";
import {
  activeLLMConfigAtom,
  activeLLMProviderAtom,
  LLMProvider,
} from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

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

  const handleSave = () => {
    onOpenChange(false);
  };

  console.log(llmConfig)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[540px] bg-dark-100 border-zinc-800"
      >
        <SheetHeader className="p-6">
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
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="openai-like">OpenAI like</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            {activeProvider === "openai" ? (
              <Select
                value={llmConfig.model}
                onValueChange={(value) => setLlmConfig({ model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="model"
                value={llmConfig.model}
                onChange={(e) => setLlmConfig({ model: e.target.value })}
                placeholder="Enter model name"
              />
            )}
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={llmConfig.apiKey}
              onChange={(e) => setLlmConfig({ apiKey: e.target.value })}
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
                onChange={(e) =>
                  setLlmConfig({endpoint: e.target.value})
                }
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
              onValueChange={(value) =>
                setLlmConfig({ temperature: value[0] })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave}>Save Settings</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
