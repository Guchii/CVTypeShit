import { useAtom } from "jotai"
import { llmConfigAtom } from "@/lib/atoms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

type LLMConfigSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LLMConfigSheet({ open, onOpenChange }: LLMConfigSheetProps) {
  const [llmConfig, setLlmConfig] = useAtom(llmConfigAtom)

  const handleSave = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px] bg-dark-100 border-zinc-800">
        <SheetHeader className="p-6">
          <SheetTitle className="text-4xl">LLM Settings</SheetTitle>
        </SheetHeader>
        <div className="px-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={llmConfig.provider}
              onValueChange={(value) => setLlmConfig((prev) => ({ ...prev, provider: value }))}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OpenAI">OpenAI</SelectItem>
                <SelectItem value="Anthropic">Anthropic</SelectItem>
                <SelectItem value="Groq">Groq</SelectItem>
                <SelectItem value="Custom">Custom Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={llmConfig.model}
              onValueChange={(value) => setLlmConfig((prev) => ({ ...prev, model: value }))}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {llmConfig.provider === "OpenAI" && (
                  <>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </>
                )}
                {llmConfig.provider === "Anthropic" && (
                  <>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </>
                )}
                {llmConfig.provider === "Groq" && (
                  <>
                    <SelectItem value="llama3-70b-8192">Llama 3 70B</SelectItem>
                    <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                  </>
                )}
                {llmConfig.provider === "Custom" && <SelectItem value="custom">Custom Model</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={llmConfig.apiKey}
              onChange={(e) => setLlmConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your API key"
            />
          </div>

          {/* Custom Endpoint (for custom provider) */}
          {llmConfig.provider === "Custom" && (
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                value={llmConfig.endpoint || ""}
                onChange={(e) => setLlmConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>
          )}

          {/* Temperature */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {llmConfig.temperature}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[llmConfig.temperature]}
              onValueChange={(value) => setLlmConfig((prev) => ({ ...prev, temperature: value[0] }))}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Advanced Options</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="streaming" className="cursor-pointer">
                Enable streaming responses
              </Label>
              <Switch
                id="streaming"
                checked={llmConfig.streaming}
                onCheckedChange={(checked) => setLlmConfig((prev) => ({ ...prev, streaming: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="contextWindow" className="cursor-pointer">
                Include full resume in context
              </Label>
              <Switch
                id="contextWindow"
                checked={llmConfig.includeResumeContext}
                onCheckedChange={(checked) => setLlmConfig((prev) => ({ ...prev, includeResumeContext: checked }))}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave}>Save Settings</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
