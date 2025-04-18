import type React from "react";

import { useState, useRef, useEffect } from "react";
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { userAtom, llmConfigAtom } from "@/lib/atoms";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "./ui/chat/chat-bubble";
import { openRouterHandler } from "@/lib/llm";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [userProfile] = useAtom(userAtom);
  const [llmConfig] = useAtom(llmConfigAtom);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [lastAIMessage, setLastAIMessage] = useState<
    Pick<Message, "content"> & {
      status: "loading" | "streaming" | "complete" | "error";
    }
  >({
    status: "complete",
    content: "",
  });

  const messageCount = messages.length;

  useEffect(() => {
    if (messageCount && messages[messageCount - 1].role === "user")
      (async function () {
        setLastAIMessage((prev) => ({
          ...prev,
          status: "loading",
        }));
        const result = openRouterHandler.generateStream({
          messages,
          onFinish: (e) => {
            setInput("");
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
            setLastAIMessage((prev) => ({
              ...prev,
              content: "",
              status: "complete",
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
              break;
            }
            case "source": {
              // handle source here
              break;
            }
            case "tool-call": {
              switch (part.toolName) {
                case "cityAttractions": {
                  // handle tool call here
                  break;
                }
              }
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
      })();
  }, [messageCount]);

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-100">
      <div className="flex-1 overflow-y-auto p-2">
        <ChatMessageList>
          {messages.length === 0 && (
            <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
              <h1 className="font-bold">Welcome to Resume Builder.</h1>
              <p className="text-muted-foreground text-sm">
                This is a very simple app that uses Vercel AI SDK, Typst WASM
                Build to generate and tweak resumes;
              </p>
              <p className="text-muted-foreground text-sm">
                Make sure to also checkout the shadcn-chat support component at
                the bottom right corner.
              </p>
            </div>
          )}
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                src={
                  message.role === "user"
                    ? userProfile.avatarUrl
                    : "//placecats.com/300/300"
                }
                fallback={message.role === "user" ? userProfile.name : "AI"}
              />
              <ChatBubbleMessage
                variant={message.role === "user" ? "sent" : "received"}
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </Markdown>
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
          {lastAIMessage.status !== "complete" && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="//placecats.com/300/300" fallback="AI" />
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
              </ChatBubbleMessage>
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <ChatInput
            placeholder="Type your message here..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            disabled={lastAIMessage.status !== "complete"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSendMessage(e);
              }
            }}
          />
          <div className="flex items-center p-3 pt-0">
            <Button size="sm" className="ml-auto gap-1.5">
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
