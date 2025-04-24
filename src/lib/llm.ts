import { createOpenAI, OpenAIProvider, OpenAIProviderSettings } from "@ai-sdk/openai";
import { streamText, StreamTextResult, ToolSet } from "ai";
import { joinURL, withoutTrailingSlash } from "ufo";

type Model = {
  id: string,
  name?: string,
}

interface ApiHandler {
  generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown>;
  getModels(): Promise<Model[]>;
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
    options.baseURL = options.baseURL ?? "https://openrouter.ai/api/v1/";
    this.client = createOpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL,
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

  async getModels(): Promise<Model[]> {
    const response = await fetch(
      new Request(
        joinURL(withoutTrailingSlash(this.options.baseURL), "models"),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
    if (!response.ok)
    {
      throw new Error(
        `Failed to fetch models: ${response.status} ${response.statusText}`
      );
    }
    const json = await response.json();
    return json.data;
  }
}

export class PollinationsHandler extends openAIHandler {
  constructor(model?: string, temperature?: number) {
    super({
      baseURL: "https://text.pollinations.ai/openai",
      model: model ?? "openai",
      apiKey: "djflasdjfaslkdf",
      temperature: temperature ?? 0.7,
      headers: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        Authorization: null,
      },
    });
  }
}
