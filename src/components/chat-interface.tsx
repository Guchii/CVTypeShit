import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAtom } from "jotai"
import { userAtom, llmConfigAtom } from "@/lib/atoms"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm your AI resume assistant. How can I help you build your perfect resume today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile] = useAtom(userAtom)
  const [llmConfig] = useAtom(llmConfigAtom)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'll help you with "${input}". Let's update your resume with this information.`,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {message.role === "assistant" ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={'//placecats.com/100/100'} />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback>
                      {userProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg ${
                    message.role === "user" ? "bg-dark-accent p-3 text-primary-foreground" : "bg-dark-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-dark-100">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your resume or request changes..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-2 text-xs text-muted-foreground">
          Using {llmConfig.provider} with {llmConfig.model}
        </div>
      </div>
    </div>
  )
}
