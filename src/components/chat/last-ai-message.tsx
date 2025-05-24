import type { TLastAIMessage } from "@/hooks/use-chat";
import _ from "lodash";
import { RefreshCcw } from "lucide-react";
import Markdown from "react-markdown";
import { Fragment } from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAction,
} from "../ui/chat/chat-bubble";
import ToolCall from "./tool-call";

export default function LastAIMessage({
  lastAIMessage,
  handleGeneration,
}: {
  lastAIMessage: TLastAIMessage;
  handleGeneration: () => void;
}) {
  if (lastAIMessage.status === "complete") return null;
  if (lastAIMessage.status === "loading")
    return (
      <ChatBubble variant="received">
        <ChatBubbleMessage variant="received">
          <img src="/loading.gif" width={80} height={80} alt="epic-loader" />
        </ChatBubbleMessage>
      </ChatBubble>
    );
  if (lastAIMessage.status === "error")
    return (
      <Fragment>
        <ChatBubble variant="received">
          <ChatBubbleMessage variant="received">
            {lastAIMessage.content}
          </ChatBubbleMessage>
        </ChatBubble>
        <ChatBubbleAction
          onClick={() => handleGeneration()}
          icon={<RefreshCcw className="size-3.5" />}
        />
      </Fragment>
    );
  return (
    <Fragment>
      <ChatBubble variant="received">
        <ChatBubbleMessage variant="received">
          {lastAIMessage.content && (
            <Fragment>
              <Markdown remarkPlugins={[remarkGfm]}>
                {lastAIMessage.content}
              </Markdown>
            </Fragment>
          )}
        </ChatBubbleMessage>
      </ChatBubble>
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
              toolCallId={call.toolCallId}
              query={call.args.jqQuery}
            />
          );
        return null;
      })}
    </Fragment>
  );
}
