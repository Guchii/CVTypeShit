import { useMemo } from "react";
import { ArrowUp, AtSign, Square, Undo } from "lucide-react";
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
  isReadyToCompileAtom,
} from "@/lib/atoms";
import { ChatMessageList } from "../ui/chat/chat-message-list";

import { PromptSuggestion } from "../ui/prompt-suggestion";
import { triggerImportResumeAtom } from "../sheets/user-profile";
import ChatMessage from "./message";
import Greeting from "../greeting.mdx";
import useChat from "@/hooks/use-chat";
import _ from "lodash";
import LastAIMessage from "./last-ai-message";

export default function ChatInterface() {
  const typstDocument = useAtomValue(documentAtom);
  const typstLoaded = useAtomValue(isReadyToCompileAtom);

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
          {messages.length - 1 === 0 && (
            <div className="mt-14 prose prose-invert prose-headings:m-0 prose-headings:mb-4 prose-li:text-white prose-img:m-0 prose-img:my-2">
              <Greeting />
            </div>
          )}
          {messages.map((message, i) =>
            _.isString(message) ? (
              <Button
                size={"lg"}
                variant={"outline"}
                onClick={() => typstDocument.resetToCheckpoint(message)}
                className="self-end"
              >
                <Undo /> Checkpoint {message.substring(0, 5)}
              </Button>
            ) : (
              <ChatMessage key={i} {...message} />
            )
          )}
          <LastAIMessage {...{ handleGeneration, lastAIMessage }} />
        </ChatMessageList>
      </div>
      <div className="p-4 space-y-2">
        {messageCount - 1 === 0 && (
          <PromptSuggestion
            onClick={() => {
              triggerImportResume();
            }}
            disabled={!typstLoaded}
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
            disabled={isLoading || !typstLoaded}
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
                disabled={!input.length || !typstLoaded}
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
