import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";

import { atom, useAtom, useAtomValue } from "jotai";
import { llmHandlerAtom } from "@/lib/atoms";

import { atomWithStorage, RESET } from "jotai/utils";

import { CoreMessage, ToolSet } from "ai";
export const messagesAtom = atomWithStorage<CoreMessage[]>("messages", [
  {
    role: "system",
    content: `Role:
You are "Resume Pundit", an AI assistant that helps users build professional resumes. A live preview updates automatically as changes are made.

Key Responsibilities:

Fetch & Display Current Data:

Start by retrieving the user’s existing personal details (if any) using getPersonalData.

Clearly summarize the current info before making edits.

Structured Personal Data Collection:

Guide the user step-by-step to provide:

Full name

Email & phone number

LinkedIn/portfolio links (optional)

Location (city/country)

Never ask for JSON input—users interact naturally; you handle the structured updates.

Job-Tailored Suggestions:

Ask about the target job/industry to offer relevant advice (e.g., "For software roles, add GitHub over hobbies.").

Communication Style:

Friendly but professional – Avoid jargon.

Clear, directive questions: "What’s your full name?" vs. "Can you share your name?"

Explain why: "A professional email (e.g., name@domain.com) boosts credibility."

Suggest optimizations: "Add a LinkedIn link? Recruiters often check profiles."

Critical Rules:

Never mention JSON/technical terms – Users interact naturally; you map responses to structured data.

No confirmations for updates – Assume the live preview lets them self-verify.

Prevent empty fields – If a user skips data, note it’s optional (e.g., "We can add your phone later.").

First Interaction Flow:

Greet briefly: "Hi! I’ll help you build your resume. Let’s start with your basics—what’s your full name?"

Fetch existing data with getPersonalData. If none, proceed step-by-step.

After collecting basics, ask: "Are you targeting a specific job? This helps tailor your resume."`,
  },
]);

export const resetMessagesAtom = atom(
  (get) => get(messagesAtom),
  (_, set) => {
    set(messagesAtom, RESET);
  }
);

export default function useChat({ tools }: { tools: ToolSet } = { tools: {} }) {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [input, setInput] = useState("");
  const abortController = useRef<AbortController>(new AbortController());

  const [lastAIMessage, setLastAIMessage] = useState<{
    status: "loading" | "streaming" | "complete" | "error";
    content: string;
  }>({
    status: "complete",
    content: "",
  });
  const llmHandler = useAtomValue(llmHandlerAtom);
  const messageCount = messages.length;

  const handleGeneration = useCallback(async () => {
    if (abortController.current.signal.aborted) {
      abortController.current = new AbortController();
    }

    setLastAIMessage((prev) => ({
      ...prev,
      status: "loading",
    }));

    const result = llmHandler.generateStream({
      messages,
      tools: tools,
      abortSignal: abortController.current.signal,
      maxSteps: 2,
      onFinish: (e) => {
        setLastAIMessage({
          content: "",
          status: "complete",
        });
        setMessages((prev) => [...prev, ...e.response.messages]);
        setInput("");
      },
      onError: ({ error }) => {
        const errorMessage = error instanceof Error ? error.message : undefined;
        setLastAIMessage((prev) => ({
          ...prev,
          content: errorMessage || "Unknown error",
          status: "error",
        }));
      },
    });
    for await (const part of result.fullStream) {
      switch (part.type) {
        case "text-delta": {
          console.log("Text delta:", part.textDelta);
          setLastAIMessage((prev) => ({
            ...prev,
            content: prev.content + part.textDelta,
            status: "streaming",
          }));
          break;
        }
        case "reasoning": {
          // handle reasoning here
          setLastAIMessage((prev) => ({
            ...prev,
            content: prev.content + part.textDelta,
            status: "streaming",
          }));
          break;
        }
        case "source": {
          // handle source here
          break;
        }
        case "tool-call": {
          console.log("Tool call:", part.toolName, part.args);
          break;
        }
        case "finish": {
          // handle finish here
          console.log("Finished", part.finishReason);
          if (part.finishReason === "tool-calls") {
            console.log("Tool calls:", part);
          }
          break;
        }
        case "error": {
          // handle error here
          break;
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageCount, llmHandler, tools]);

  useEffect(() => {
    if (messageCount && messages[messageCount - 1].role === "user")
      handleGeneration();
  }, [messageCount, handleGeneration]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim()) return;

    const userMessage: CoreMessage = {
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    handleSendMessage,
    lastAIMessage,
    messageCount,
    abortController,
    llmHandler,
    handleGeneration,
  };
}
