import { Fragment, useMemo } from "react";
import { ArrowUp, AtSign, RefreshCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";

import { useAtomValue, useSetAtom } from "jotai";
import {
  activeLLMConfigAtom,
  documentAtom,
  llmSheetOpenAtom,
} from "@/lib/atoms";
import { ChatMessageList } from "../ui/chat/chat-message-list";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleMessage,
} from "../ui/chat/chat-bubble";

import { PromptSuggestion } from "../ui/prompt-suggestion";
import { triggerImportResumeAtom } from "../sheets/user-profile";
import ChatMessage from "./message";
import Greeting from "../greeting";
import useChat from "@/hooks/use-chat";
import ToolCall from "./tool-call";
import _ from "lodash";

export default function ChatInterface() {
  const typstDocument = useAtomValue(documentAtom);

  const tools = useMemo(() => {
    return typstDocument.getTools();
  }, [typstDocument]);

  const {
    messages,
    lastAIMessage,
    handleGeneration,
    messageCount,
    abortController,
    input,
    setInput,
    handleSendMessage,
  } = useChat({
    tools,
  });

  const llmConfig = useAtomValue(activeLLMConfigAtom);

  const setLlmSheetOpen = useSetAtom(llmSheetOpenAtom);
  const triggerImportResume = useSetAtom(triggerImportResumeAtom);

  const isLoading =
    lastAIMessage.status === "loading" || lastAIMessage.status === "streaming";

  return (
    <div className="flex flex-col h-[calc(100vh)]">
      <div className="flex-1 overflow-y-auto p-2">
        <ChatMessageList smooth>
          {messages.length - 1 === 0 && <Greeting />}
          {messages.map((message, i) => (
              <ChatMessage key={i} {...message} />
          ))}
          {lastAIMessage.status !== "complete" && (
            <Fragment>
              {lastAIMessage.content && (
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
              {lastAIMessage.tool_calls.map((call, i) => {
                if (
                  _.isObject(call.args) &&
                  "jqQuery" in call.args &&
                  typeof call.args.jqQuery === "string"
                )
                  return (
                    <ToolCall
                      key={i}
                      toolName={call.toolName as "query" | "mutate"}
                      completed={call.completed}
                      query={call.args.jqQuery}
                    />
                  );
                return null;
              })}
            </Fragment>
          )}
        </ChatMessageList>
      </div>
      <div className="p-4 space-y-2">
        {messageCount - 1 === 0 && (
          <PromptSuggestion
            onClick={() => {
              triggerImportResume();
            }}
            className="hover:border-ring rounded-md"
          >
            Import Resume
          </PromptSuggestion>
        )}
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isLoading}
          onSubmit={handleSendMessage}
          className="w-full rounded-md"
        >
          <PromptInputTextarea
            className="text-foreground"
            placeholder="Tell about yourself or paste a JD or just ask a question"
            disabled={isLoading}
          />
          <PromptInputActions className="justify-end pt-2">
            <PromptInputAction
              tooltip={`${llmConfig.provider}/${llmConfig.model}`}
            >
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8"
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
                className="h-8 w-8 bg-white text-accent-foreground hover:bg-accent/80"
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
