import { streamText, StreamTextResult, ToolSet } from "ai";
import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";

interface ApiHandler {
    generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown>;
}

export class openAIHandler implements ApiHandler {
  client: OpenAIProvider;
  constructor(
    private apiKey: string,
    private baseURL: string = "https://openrouter.ai/api/v1/",
    private temperature: number = 0.7,
    private model: string = "google/gemma-2-9b-it:free",
  ) {
    this.client = createOpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
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

export const openRouterHandler = new openAIHandler(
  import.meta.env.VITE_OPENROUTER_KEY as string,
);
