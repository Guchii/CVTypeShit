import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { CornerDownLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import startCase from "lodash.startcase";
import {
  userSheetOpenAtom,
  llmHandlerAtom,
  activeLLMConfigAtom,
  documentAtom,
} from "@/lib/atoms";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleMessage,
} from "./ui/chat/chat-bubble";
import { atomWithStorage, RESET } from "jotai/utils";

import { ToolResult } from "ai";
import { Tools } from "@/lib/tools";

const messagesAtom = atomWithStorage<Message[]>("messages", [
  {
    role: "system",
    content: `You are "Resume Bandhhu", a specialized AI assistant designed to help users create professional resumes. Your interface includes a live preview of the resume being built, which updates in real-time based on changes to a YAML template.

Key Responsibilities:
1. First, attempt to fetch and display the current YAML resume data to establish context
2. Guide users through a structured resume-building process:
   - Start by collecting personal information (name, contact details, etc.)
   - Ask for the target job description/role to tailor the resume
   - Systematically gather information for each resume section

Special Features:
- Offer to parse uploaded resumes (PDF/DOCX) and auto-populate the YAML
- Provide industry-specific suggestions based on the target job
- Recommend powerful action verbs and achievement-oriented language
- Ensure ATS (Applicant Tracking System) compatibility
- Offer formatting options (chronological, functional, or hybrid)

Communication Style:
- Friendly yet professional tone
- Ask clear, specific questions
- Provide explanations for resume best practices
- Offer multiple options/suggestions when appropriate
- Never show the YAML template directly to the user, Assume the users are not familiar with YAML
- Never ask for confirmation or validation of the YAML

Technical Notes:
- All changes must be made by updating the YAML template
- The live preview will automatically sync with YAML updates
- Maintain clean YAML syntax at all times

First Interaction:
1. Greet the user and explain your capabilities
2. Check for existing YAML data
3. Ask if they want to:
   - Start a new resume
   - Upload an existing resume to parse
   - Edit an existing resume
   - Get help with a specific section`,
    id: Date.now().toString(),
    timestamp: new Date(),
  },
]);

export const resetMessagesAtom = atom(
  (get) => get(messagesAtom),
  (_, set) => {
    set(messagesAtom, RESET);
  }
);

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  tools?: ToolResult<
    string,
    object,
    Record<string, unknown> & { success: boolean }
  >[];
};

export default function ChatInterface() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const typstDocument = useAtomValue(documentAtom);
  const tools = useRef(new Tools(typstDocument));

  const [input, setInput] = useState("");
  const llmConfig = useAtomValue(activeLLMConfigAtom);
  const llmHandler = useAtomValue(llmHandlerAtom);

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
    setLastAIMessage((prev) => ({
      ...prev,
      status: "loading",
    }));
    const result = llmHandler.generateStream({
      messages,
      tools: {
        ...tools.current.getTools(),
      },
      toolCallStreaming: true,
      maxSteps: 2,
      onFinish: (e) => {
        console.log(e);
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
          break;
        }
        case "error": {
          // handle error here
          break;
        }
      }
    }
  }, [messageCount, llmHandler]);

  useEffect(() => {
    if (messageCount && messages[messageCount - 1].role === "user")
      handleGeneration();
  }, [messageCount, handleGeneration]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  const setUserSheetOpen = useSetAtom(userSheetOpenAtom);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-100">
      <div className="flex-1 overflow-y-auto p-2">
        <ChatMessageList>
          {messages.filter((message) => message.role !== "system").length === 0 && (
            <div className="w-full bg-background shadow-md rounded-lg flex flex-col overflow-hidden">
              <h1 className="font-bold text-4xl md:text-5xl leading-tight">
                Resume Builder
              </h1>
              <div className="text-white text-base">
                <p className="text-lg font-medium my-2">
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
            .map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === "user" ? "sent" : "received"}
              >
                <ChatBubbleMessage
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </Markdown>
                  {message.tools &&
                    message.tools.map((toolResult, index) => {
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
                  icon={
                    <Button>
                      <RefreshCcw className="size-3.5" />
                    </Button>
                  }
                />
              )}
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <ChatInput
            placeholder="Type your message here..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            disabled={
              lastAIMessage.status !== "complete" &&
              lastAIMessage.status !== "error"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSendMessage(e);
              }
            }}
          />
          <div className="flex items-center p-3 pt-0">
            <Button
              disabled={
                lastAIMessage.status !== "complete" &&
                lastAIMessage.status !== "error"
              }
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
        <div className="mt-2 text-xs text-muted-foreground">
          Using {llmConfig.provider} with {llmConfig.model}
        </div>
      </div>
    </div>
  );
}
