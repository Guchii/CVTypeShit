import { atom } from "jotai";

// Import the new type
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";

import { OpenAIHandler, OpenRouterHandler, PollinationsHandler } from "./llm";
import { TypstDocument } from "./typst";
import { ResumeData } from "./types/resume-data";
import { InitOptions } from "@myriaddreamin/typst.ts/dist/esm/options.init.mjs";
import compilerURL from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";
import rendererURL from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import { logger } from "./consola";

// User profile atom using ResumeData type
export const userAtom = atom<ResumeData>({
  personal: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    url: "https://johndoe.com", // Added default
    titles: ["Software Engineer"], // Added default
    location: {
      city: "San Francisco", // Adjusted structure
      region: "CA", // Adjusted structure
      country: "USA", // Added default
    },
    profiles: [
      // Added default
      {
        network: "LinkedIn",
        username: "johndoe",
        url: "https://linkedin.com/in/johndoe",
      },
      {
        network: "GitHub",
        username: "johndoe",
        url: "https://github.com/johndoe",
      },
    ],
    // 'summary' and 'avatarUrl' from old type are not in ResumeData.personal
  },
  work: [
    // Adjusted structure and mapped fields
    {
      organization: "Tech Solutions Inc.",
      url: "https://techsolutions.example.com", // Added default URL
      location: "San Francisco, CA", // Added default location
      positions: [
        {
          position: "Senior Software Engineer",
          startDate: "2020-01-01", // Mapped 'period' roughly
          endDate: "present", // Mapped 'period' roughly
          highlights: [
            "Led development of a customer-facing web application that increased user engagement by 40%.", // Mapped 'description'
            "Mentored junior developers and implemented best practices for code quality.", // Mapped 'description'
          ],
        },
      ],
    },
    {
      organization: "Digital Innovations",
      url: "https://digitalinnovations.example.com", // Added default URL
      location: "San Francisco, CA", // Added default location
      positions: [
        {
          position: "Software Developer",
          startDate: "2017-01-01", // Mapped 'period' roughly
          endDate: "2019-12-31", // Mapped 'period' roughly
          highlights: [
            "Developed and maintained multiple web applications using React and Node.js.", // Mapped 'description'
            "Collaborated with design team to implement responsive UI components.", // Mapped 'description'
          ],
        },
      ],
    },
  ],
  education: [
    // Adjusted structure and mapped fields
    {
      institution: "University of Technology",
      url: "https://universityoftechnology.example.com", // Added default URL
      area: "Computer Science", // Mapped 'degree'
      studyType: "Master", // Mapped 'degree'
      startDate: "2015-09-01", // Mapped 'period' roughly
      endDate: "2017-05-31", // Mapped 'period' roughly
      location: "Tech City, USA", // Added default location
      honors: [], // Added default
      courses: [], // Added default
      highlights: [], // Added default
    },
    {
      institution: "State University",
      url: "https://stateuniversity.example.com", // Added default URL
      area: "Computer Engineering", // Mapped 'degree'
      studyType: "Bachelor of Science", // Mapped 'degree'
      startDate: "2011-09-01", // Mapped 'period' roughly
      endDate: "2015-05-31", // Mapped 'period' roughly
      location: "State City, USA", // Added default location
      honors: [], // Added default
      courses: [], // Added default
      highlights: [], // Added default
    },
  ],
  skills: [
    // Adjusted structure
    { category: "Programming", skills: ["JavaScript", "React", "Node.js"] }, // Mapped old 'skills'
  ],
  affiliations: [], // Added default
  awards: [], // Added default
  certificates: [], // Added default
  publications: [], // Added default
  projects: [], // Added default
  languages: [], // Added default
  interests: [], // Added default
  references: [], // Added default
});

export type LLMProvider =
  | "pollinations"
  | "openrouter"
  | "openai"
  | "openai-like";

// LLM configuration atom
export type LLMConfig = {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature: number;
};

export const llmConfigAtom = atomWithStorage<Record<LLMProvider, LLMConfig>>(
  "llm-config",
  {
    pollinations: {
      provider: "pollinations",
      model: "openai",
      endpoint: "https://text.pollinations.ai/openai",
      apiKey: "",
      temperature: 0.7,
    },
    openrouter: {
      provider: "openrouter",
      model: "mistralai/mistral-small-3.1-24b-instruct:free",
      endpoint: "https://openrouter.ai/v1/",
      apiKey: "",
      temperature: 0.7,
    },
    "openai-like": {
      provider: "openai-like",
      model: "openai",
      endpoint: "https://openrouter.ai/api/v1/",
      apiKey: "",
      temperature: 0.7,
    },
    openai: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      apiKey: import.meta.env.VITE_OPENAI_KEY as string,
      endpoint: "https://api.openai.com/v1/chat/completions",
      temperature: 0.7,
    },
  }
);

export const activeLLMProviderAtom = atomWithStorage<LLMProvider>(
  "active-llm-provider",
  "pollinations"
);

export const activeLLMConfigAtom = atom(
  (get) => {
    const activeProvider = get(activeLLMProviderAtom);
    return get(llmConfigAtom)[activeProvider];
  },
  (get, set, args: Partial<LLMConfig>) => {
    const activeProvider = get(activeLLMProviderAtom);
    const llmConfig = get(llmConfigAtom)[activeProvider];
    set(llmConfigAtom, {
      ...get(llmConfigAtom),
      [activeProvider]: {
        ...llmConfig,
        ...args,
      },
    });
  }
);

export const llmHandlerAtom = atom((get) => {
  const activeProvider = get(activeLLMProviderAtom);
  const llmConfig = get(llmConfigAtom)[activeProvider];
  switch (activeProvider) {
    case "openrouter":
      return new OpenRouterHandler({
        model: llmConfig.model,
        temperature: llmConfig.temperature,
        apiKey: llmConfig.apiKey,
      });
    case "pollinations":
      return new PollinationsHandler(llmConfig.model, llmConfig.temperature);
    default:
      return new OpenAIHandler({
        model: llmConfig.model,
        temperature: llmConfig.temperature,
        apiKey: llmConfig.apiKey,
        baseURL: llmConfig.endpoint,
      });
  }
});

const fetchArrayBuffer = async (url: string) => {
  const chunks: Array<Uint8Array<ArrayBufferLike>> = [];

  const response = await fetch(new URL(url, import.meta.url), {
    headers: {
      "content-type": "application/wasm",
    },
  });

  const contentLength = response.headers.get("Content-Length");
  let recievedLength = 0;

  if (response.body) {
    const reader = response.body.getReader();

    while (response.body) {
      const { done, value } = (await reader.read()) ?? {};

      if (done) {
        break;
      }

      recievedLength += value.length;
      chunks.push(value);

      logger.log(`Received ${recievedLength} of ${contentLength}`);
    }
  }
  const allChunks = new Uint8Array(recievedLength);

  let position = 0;

  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  return allChunks.buffer;
};

const createOptions: (url: string) => Promise<Partial<InitOptions>> = async (
  url: string
) => {
  const arrayBuffer = await fetchArrayBuffer(url);
  return {
    getModule: () => arrayBuffer,
  };
};

// Active Document State
export const documentAtom = atom(
  async () =>
    new TypstDocument(undefined, undefined, undefined, {
      compiler: await createOptions(compilerURL),
      renderer: await createOptions(rendererURL),
    })
);

// Sheets State
export const userSheetOpenAtom = atom(false);
export const llmSheetOpenAtom = atom(false);
export const filesSheetOpenAtom = atom(false);

// Query Atoms
export const modelsAtom = atomWithQuery((get) => {
  const llmHandler = get(llmHandlerAtom);
  const activeProvider = get(activeLLMProviderAtom);
  return {
    queryKey: ["models", activeProvider],
    queryFn: async () => {
      return await llmHandler.getModels();
    },
    staleTime: 60 * 60 * 24 * 1000, // 1 day
    cacheTime: 60 * 60 * 24 * 1000, // 1 day
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };
});

export const eyeSaverModeAtom = atomWithStorage("eye-saver-mode", false);
