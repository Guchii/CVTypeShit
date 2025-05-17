import {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  CoreUserMessage,
} from "ai";
import { ChatBubbleMessage } from "../ui/chat/chat-bubble";
import _ from "lodash";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { InfoIcon } from "lucide-react";

type Props = CoreMessage;

export function ChatMessage(props: Props) {
  switch (props.role) {
    case "system":
      return null;
    case "user":
      return <UserMessage {...props} />;
    case "assistant":
      return <AssistantMessage {...props} />;
    case "tool":
      return <ToolMessage {...props} />;
    default:
      return <div>Unknown</div>;
  }
}

function UserMessage(props: CoreUserMessage) {
  if (typeof props.content === "string") {
    return (
      <ChatBubbleMessage
        variant={props.role === "user" ? "sent" : "received"}
        role="user"
      >
        {props.content}
      </ChatBubbleMessage>
    );
  }
}

function AssistantMessage(props: CoreAssistantMessage) {
  return (
    <ChatBubbleMessage role="assistant">
      <div className="prose-base [&>*]:m-0 prose-ul:list-disc break-words whitespace-normal">
        {_.isArray(props.content) &&
          props.content.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <Markdown key={i} remarkPlugins={[remarkGfm]}>
                    {part.text}
                  </Markdown>
                );
              case "tool-call":
                return (
                  <div className="flex items-center gap-2 not-prose" key={i}>
                    <Collapsible>
                      <CollapsibleTrigger className="cursor-pointer flex items-center gap-3 justify-between w-fit">
                        <strong className="flex items-center gap-2">
                          Tool Request
                          <span>
                            {_.startCase(part.toolName)} 🙋‍♀
                          </span>
                        </strong>
                        <InfoIcon />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <pre className="space-y-4 mt-4 max-w-[560px] overflow-scroll">
                          {JSON.stringify(part.args, null, 2)}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              default:
                return null;
            }
          })}
      </div>
    </ChatBubbleMessage>
  );
}

function ToolMessage(props: CoreToolMessage) {
  return (
    <ChatBubbleMessage role="tool">
      {_.isArray(props.content) &&
        props.content.map((part, i) => {
          return (
            <div className="flex items-center not-prose" key={i}>
              {_.startCase(part.toolName)}{" "}
              {_.isString(part.result) && _.includes(part.result, "Failed") ? (
                <span className="w-fit">Failed 😭</span>
              ) : (
                "✅"
              )}
            </div>
          );
        })}
    </ChatBubbleMessage>
  );
}

export default ChatMessage;
