import { streamText, StreamTextResult, ToolSet } from "ai";
import {
  createOpenAI,
  OpenAIProvider,
  OpenAIProviderSettings,
} from "@ai-sdk/openai";

interface ApiHandler {
  generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown>;
}

export class openAIHandler implements ApiHandler {
  client: OpenAIProvider;
  constructor(
    private options: Partial<OpenAIProviderSettings> & {
      model: string;
      temperature: number;
    } = {
      model: "google/gemma-2-9b-it:free",
      temperature: 0.7,
    }
  ) {
    this.client = createOpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL ?? "https://openrouter.ai/api/v1/",
      ...options,
    });
  }

  generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown> {
    return streamText({
      model: this.client(this.options.model),
      temperature: this.options.temperature,
      ...options,
    });
  }
}

export class PollinationsHandler extends openAIHandler {
  constructor(model?: string, temperature?: number) {
    super({
      baseURL: "https://text.pollinations.ai/openai",
      model: model ?? 'openai',
      apiKey: "djflasdjfaslkdf",
      temperature: temperature ?? 0.7,
      headers: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        Authorization: null
      }
    });
  }
}
