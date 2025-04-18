import type React from "react";

import { useState, useRef, useEffect } from "react";
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { userAtom, llmConfigAtom } from "@/lib/atoms";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "./ui/chat/chat-bubble";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! I'm your AI resume assistant. How can I help you build your perfect resume today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile] = useAtom(userAtom);
  const [llmConfig] = useAtom(llmConfigAtom);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'll help you with "${input}". Let's update your resume with this information.`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-100">
      <div className="flex-1 overflow-y-auto p-4">
          <ChatMessageList>
            {
                messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    variant={message.role === "user" ? "sent" : "received"}
                  >
                    <ChatBubbleAvatar
                      src={message.role === "user" ? userProfile.avatarUrl : '//placecats.com/300/300'}
                      fallback={message.role === "user" ? userProfile.name : "AI"}
                    />
                    <ChatBubbleMessage
                      variant={message.role === "user" ? "sent" : "received"}
                    >
                      {message.content}
                    </ChatBubbleMessage>
                  </ChatBubble>
                ))
            }
            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  src="//placecats.com/300/300"
                  fallback="AI"
                />
                {/* <ChatBubbleMessage isLoading variant="received"/> */}
                <ChatBubbleMessage
                  variant="received"
                >
                    <img src="/loading.gif" width={80} height={80} alt="epic-loader" />
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
            disabled={isLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSendMessage(e);
              }
            }
            }
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
