import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { TypstDocument } from "./typst";
import { sampleResumeContent } from "./content";
import { openAIHandler, PollinationsHandler } from "./llm";

// User profile atom
export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  avatarUrl: string;
  experience: {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
  skills: string[];
};

export const userAtom = atom<UserProfile>({
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
  summary:
    "Experienced software engineer with a passion for building user-friendly applications. Skilled in JavaScript, React, and Node.js with a track record of delivering high-quality products on time.",
  avatarUrl: "//placecats.com/400/400",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Solutions Inc.",
      period: "2020 - Present",
      description:
        "Led development of a customer-facing web application that increased user engagement by 40%. Mentored junior developers and implemented best practices for code quality.",
    },
    {
      title: "Software Developer",
      company: "Digital Innovations",
      period: "2017 - 2020",
      description:
        "Developed and maintained multiple web applications using React and Node.js. Collaborated with design team to implement responsive UI components.",
    },
  ],
  education: [
    {
      degree: "Master of Computer Science",
      institution: "University of Technology",
      period: "2015 - 2017",
    },
    {
      degree: "Bachelor of Science in Computer Engineering",
      institution: "State University",
      period: "2011 - 2015",
    },
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "HTML/CSS",
    "Git",
    "REST APIs",
    "SQL",
    "AWS",
    "Agile Methodologies",
  ],
});

export type LLMProvider = "pollinations" | "openai" | "openai-like";

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

export const activeLLMProviderAtom = atom<LLMProvider>("pollinations");

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
  if (activeProvider === "pollinations") {
    return new PollinationsHandler(llmConfig.model, llmConfig.temperature);
  }
  return new openAIHandler({
    model: llmConfig.model,
    temperature: llmConfig.temperature,
    apiKey: llmConfig.apiKey,
    baseURL: llmConfig.endpoint,
  });
});

// Active Document State
export const documentAtom = atom<TypstDocument>(
  new TypstDocument(sampleResumeContent)
);

// Sheets State
export const userSheetOpenAtom = atom(false);
export const llmSheetOpenAtom = atom(false);
