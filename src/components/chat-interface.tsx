import type React from "react";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ArrowUp, AtSign, RefreshCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  userSheetOpenAtom,
  llmHandlerAtom,
  activeLLMConfigAtom,
  documentAtom,
  llmSheetOpenAtom,
} from "@/lib/atoms";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleMessage,
} from "./ui/chat/chat-bubble";
import { atomWithStorage, RESET } from "jotai/utils";

import { CoreMessage } from "ai";
import { PromptSuggestion } from "./ui/prompt-suggestion";
import { triggerImportResumeAtom } from "./sheets/user-profile";
import _, { startCase } from "lodash";

const messagesAtom = atomWithStorage<CoreMessage[]>("messages", [
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

export default function ChatInterface() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const typstDocument = useAtomValue(documentAtom);

  const tools = useMemo(() => {
    return typstDocument.getTools();
  }, [typstDocument]);

  const [input, setInput] = useState("");
  const llmConfig = useAtomValue(activeLLMConfigAtom);
  const llmHandler = useAtomValue(llmHandlerAtom);
  const setLlmSheetOpen = useSetAtom(llmSheetOpenAtom);
  const triggerImportResume = useSetAtom(triggerImportResumeAtom);

  const abortController = useRef<AbortController>(new AbortController());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [lastAIMessage, setLastAIMessage] = useState<{
    status: "loading" | "streaming" | "complete" | "error";
    content: string;
  }>({
    status: "complete",
    content: "",
  });

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
        console.log("Finished", e);
        setLastAIMessage({
          content: "",
          status: "complete",
        });
        setMessages((prev) => [...prev, ...e.response.messages]);
        return;
        setInput("");
        if (e.finishReason === "tool-calls") {
          setMessages((prev) => {
            return [
              ...prev,
              {
                id: Date.now().toString(),
                content: "Ran a tool for you :)",
                role: "assistant",
                timestamp: new Date(),
                tools: e.toolResults,
                tool_calls: e.toolCalls,
              },
            ];
          });
        } else {
          setMessages((prev) => {
            return [
              ...prev,
              {
                id: Date.now().toString(),
                content: e.text,
                role: "assistant",
                timestamp: new Date(),
              },
            ];
          });
        }
        setLastAIMessage((prev) => ({
          ...prev,
          content: "",
          status: "complete",
        }));
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

  const setUserSheetOpen = useSetAtom(userSheetOpenAtom);

  const isLoading =
    lastAIMessage.status === "loading" || lastAIMessage.status === "streaming";

  return (
    <div className="flex bg-chat-background flex-col h-[calc(100vh-4rem)] border border-white">
      <div className="flex-1 overflow-y-auto p-2">
        <ChatMessageList smooth>
          {messages.filter((message) => message.role !== "system").length ===
            0 && (
            <div className="w-full rounded-lg flex flex-col overflow-hidden">
              <h1 className="font-bold text-2xl md:text-3xl leading-tight">
                Resume Builder
              </h1>
              <div className="text-white text-base">
                <p className="font-medium my-2">
                  Build a sick resume in minutes!
                </p>
                <p className="mb-4">
                  1. We have just a single no BS ATS Friendly template
                  <br />
                  2. Tell the assistant about yourself or paste a JD or{" "}
                  <span
                    onClick={() => setUserSheetOpen(true)}
                    className="underline cursor-pointer"
                  >
                    populate the resume data yourself
                  </span>
                  <br />
                  3. Click on the export pdf button on the top right to download
                  your resume
                </p>
              </div>
            </div>
          )}
          {messages
            .filter((message) => message.role !== "system")
            .map((message, i) => (
              <ChatBubble
                key={i}
                variant={message.role === "user" ? "sent" : "received"}
              >
                <ChatBubbleMessage
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {typeof message.content === "string" ? message.content : ""}
                  </Markdown>
                  {message.role === "assistant" &&
                    (_.isArray(message.content) ? message.content : []).map(
                      (toolCall, index) => {
                        if ("toolName" in toolCall) {
                          return (
                            <div
                              className="flex items-center gap-2"
                              key={index}
                            >
                              <strong><span className="underline">{startCase(toolCall.toolName)}</span> Tool Request</strong>
                              <img
                                width={16}
                                height={"auto"}
                                src="https://emojicdn.elk.sh/🙋‍♀️"
                              />
                            </div>
                          );
                        }
                        return (
                            _.isString(message.content) ? message.content : ""
                        );
                      }
                    )}
                  {message.role === "tool" &&
                    message.content.map((toolResult, index) => {
                      return (
                        <div className="flex items-center gap-2" key={index}>
                          <strong>{startCase(toolResult.toolName)}</strong>
                          <img
                            width={16}
                            height={"auto"}
                            src="https://emojicdn.elk.sh/✅"
                          />
                        </div>
                      );
                    })}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}
          {lastAIMessage.status !== "complete" && (
            <ChatBubble variant="received">
              <ChatBubbleMessage variant="received">
                {lastAIMessage.status === "streaming" && (
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {lastAIMessage.content}
                  </Markdown>
                )}
                {lastAIMessage.status === "loading" && (
                  <img
                    src="/loading.gif"
                    width={80}
                    height={80}
                    alt="epic-loader"
                  />
                )}
                {lastAIMessage.status === "error" && lastAIMessage.content}
              </ChatBubbleMessage>
              {lastAIMessage.status === "error" && (
                <ChatBubbleAction
                  onClick={() => handleGeneration()}
                  icon={<RefreshCcw className="size-3.5" />}
                />
              )}
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      <div className="p-4 space-y-2">
        {messageCount - 1 === 0 && (
          <PromptSuggestion
            onClick={() => {
              triggerImportResume();
            }}
            className="rounded-none hover:border-ring hover:bg-accent/50 hover:text-white"
          >
            Import Resume
          </PromptSuggestion>
        )}
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isLoading}
          onSubmit={handleSendMessage}
          className="w-full rounded-none bg-chat-input-background"
        >
          <PromptInputTextarea
            className="text-foreground"
            placeholder="Tell about yourself or paste a JD or just ask a question"
          />
          <PromptInputActions className="justify-end pt-2">
            <PromptInputAction
              tooltip={`${llmConfig.provider}/${llmConfig.model}`}
            >
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => setLlmSheetOpen(true)}
              >
                <AtSign className="size-5" />
              </Button>
            </PromptInputAction>
            <PromptInputAction
              tooltip={isLoading ? "Stop generation" : "Send message"}
            >
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 rounded-none bg-accent text-accent-foreground hover:bg-accent/80"
                onClick={
                  isLoading
                    ? () => abortController.current.abort()
                    : handleSendMessage
                }
              >
                {isLoading ? (
                  <Square className="size-5 fill-current" />
                ) : (
                  <ArrowUp className="size-5" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
