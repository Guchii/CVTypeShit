import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";

import { atom, useAtom, useAtomValue } from "jotai";
import { llmHandlerAtom } from "@/lib/atoms";

import { atomWithStorage, RESET } from "jotai/utils";

import { CoreMessage, ToolSet } from "ai";
import SYSTEM_PROMPT from "@/lib/prompts/system-prompt";
import { logger } from "@/lib/consola";

export const messagesAtom = atomWithStorage<CoreMessage[]>("messages", [
  {
    role: "system",
    content: SYSTEM_PROMPT,
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
      experimental_continueSteps: true,
      maxSteps: 10,
      onFinish: (e) => {
        logger.debug("Finish stream", e.response.messages);
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
          setLastAIMessage((prev) => ({
            ...prev,
            content: `${prev.content}\nRunning: ${
              part.toolName
            } ${JSON.stringify(part.args)}\n`,
            status: "streaming",
          }));
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
