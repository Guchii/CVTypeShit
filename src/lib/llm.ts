import { streamText, StreamTextResult, ToolSet } from "ai";
import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";

interface ApiHandler {
    generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown>;
}

export class OpenRouterHandler implements ApiHandler {
  client: OpenAIProvider;
  constructor(
    private apiKey: string,
    private temperature: number = 0.7,
    private model: string = "google/gemma-2-9b-it:free"
  ) {
    this.client = createOpenAI({
      apiKey: this.apiKey,
      baseURL: "https://openrouter.ai/api/v1/",
    });
  }

  generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown> {
    return streamText({
      model: this.client(this.model),
      temperature: this.temperature,
      ...options,
    });
  }
}

export const openRouterHandler = new OpenRouterHandler(
  import.meta.env.VITE_OPENROUTER_KEY as string,
);
