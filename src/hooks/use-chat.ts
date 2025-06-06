import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";

import { atom, useAtom, useAtomValue } from "jotai";
import { llmHandlerAtom } from "@/lib/atoms";

import { atomWithStorage } from "jotai/utils";

import {
  CoreMessage,
  smoothStream,
  ToolCallPart,
  ToolSet,
} from "ai";
import SYSTEM_PROMPT from "@/lib/prompts/system-prompt";
import { toolsBus } from "@/lib/tools";
import _ from "lodash";

export const messagesAtom = atomWithStorage<(CoreMessage | string)[]>("messages", [
  {
    role: "system",
    content: SYSTEM_PROMPT(),
  },
]);

export const messageCountAtom = atom((get) => {
  const messages = get(messagesAtom) ?? [];
  return messages.filter(m => typeof m === "object").length;
})

export type TLastAIMessage = {
    status: "loading" | "streaming" | "complete" | "error";
    content: string;
    tool_calls: (ToolCallPart & { completed?: true })[];
  };

export const inputAtom = atom("");

export default function useChat({ tools }: { tools: ToolSet } = { tools: {} }) {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [input, setInput] = useAtom(inputAtom);
  const abortController = useRef<AbortController>(new AbortController());

  const [lastAIMessage, setLastAIMessage] = useState<TLastAIMessage>({
    status: "complete",
    content: "",
    tool_calls: [],
  });
  const llmHandler = useAtomValue(llmHandlerAtom);
  const coreMessages = messages.filter((m) => typeof m === "object");
  const messageCount = coreMessages.length;

  const handleGeneration = useCallback(async () => {
    if (abortController.current.signal.aborted) {
      abortController.current = new AbortController();
    }

    setLastAIMessage((prev) => ({
      ...prev,
      status: "loading",
    }));

    const result = llmHandler.generateStream({
      messages: coreMessages,
      tools: tools,
      abortSignal: abortController.current.signal,
      experimental_continueSteps: true,
      experimental_transform: smoothStream(),
      maxSteps: 10,
      onStepFinish: ({ toolResults }) => {
        toolResults.forEach((toolResult) =>
        {
          const toolCallId = _.get(toolResult, 'toolCallId');

          if (toolCallId) {
            toolsBus.complete(toolCallId)
          }
        }
        );
      },
      onFinish: (e) => {
        setLastAIMessage({
          content: "",
          status: "complete",
          tool_calls: [],
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
        case "tool-call": {
          setLastAIMessage((prev) => ({
            ...prev,
            status: "streaming",
            tool_calls: [...prev.tool_calls, part],
          }));
          break;
        }
        case "finish": {
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
    if (messageCount && coreMessages[messageCount - 1].role === "user")
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
