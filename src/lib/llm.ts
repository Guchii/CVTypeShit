import {
  createOpenAI,
  OpenAIProvider,
  OpenAIProviderSettings,
} from "@ai-sdk/openai";
import { streamText, StreamTextResult, ToolSet } from "ai";
import { joinURL, withoutTrailingSlash } from "ufo";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

type Model = {
  id: string;
  name?: string;
};

interface IAIHandler {
  generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown>;
  getModels(): Promise<Model[]>;
}

interface IHandlerOptions extends Partial<OpenAIProviderSettings> {
      model: string;
      temperature: number;
  }

export class AIHandler implements IAIHandler {
  _client: OpenAIProvider;
  options: IHandlerOptions;

  constructor(
    client: OpenAIProvider,
    options : IHandlerOptions  = {
      model: "google/gemma-2-9b-it:free",
      temperature: 0.7,
    }
  ) {
    this._client = client;
    this.options = options;
  }

  get model() {
    return this._client(this.options.model);
  }

  generateStream(
    options: Partial<Parameters<typeof streamText>[0]>
  ): StreamTextResult<ToolSet, unknown> {
    return streamText({
      model: this.model,
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
    if (!response.ok) {
      throw new Error(
        `Failed to fetch models: ${response.status} ${response.statusText}`
      );
    }
    const json = await response.json();
    return json.data;
  }
}

export class PollinationsHandler extends AIHandler {
  constructor(model?: string, temperature?: number) {
    const client = createOpenAI({
      baseURL: "https://text.pollinations.ai/openai",
      apiKey: "djflasdjfaslkdf",
      headers: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        Authorization: null,
      },
    });
    super(client, {
      model: model ?? "openai",
      temperature: temperature ?? 0.7,
      baseURL: "https://text.pollinations.ai/openai",
    });
  }
}

export class OpenAIHandler extends AIHandler {
  constructor(
    options: Partial<OpenAIProviderSettings> & {
      model: string;
      temperature: number;
    } = {
      model: "google/gemma-2-9b-it:free",
      temperature: 0.7,
    }
  ) {
    const client = createOpenAI({
      apiKey: options.apiKey,
      ...options,
    });
    super(client, options);
  }
}

export class OpenRouterHandler extends AIHandler {
  constructor(
    options: Partial<OpenAIProviderSettings> & {
      model: string;
      temperature: number;
    } = {
      model: "google/gemma-2-9b-it:free",
      temperature: 0.7,
    }
  ) {
    options.baseURL = options.baseURL ?? "https://openrouter.ai/api/v1/";
    const client = createOpenRouter({
      apiKey: options.apiKey,
      baseURL: options.baseURL,
      ...options,
    }) as unknown as OpenAIProvider;
    super(client, options);
  }

  get model() {
    return this._client.chat(this.options.model);
  }
}
