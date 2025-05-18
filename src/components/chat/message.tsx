import { CoreAssistantMessage, CoreMessage, CoreUserMessage } from "ai";
import { ChatBubble, ChatBubbleMessage } from "../ui/chat/chat-bubble";
import _ from "lodash";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { InfoIcon } from "lucide-react";

type Props = CoreMessage;

export function ChatMessage(props: Props) {
  switch (props.role) {
    case "user":
      return (
        <ChatBubble variant={"sent"}>
          <UserMessage {...props} />
        </ChatBubble>
      );
    case "assistant": {
      const justTools =
        _.isArray(props.content) &&
        _.every(props.content, (part) => {
          return part.type === "tool-call";
        });
      if (justTools) return null;
      return (
        <ChatBubble variant={"received"}>
          <AssistantMessage {...props} />
        </ChatBubble>
      );
    }
    case "system":
    case "tool":
    default:
      return null;
  }
}

function UserMessage(props: CoreUserMessage) {
  if (typeof props.content === "string") {
    return (
      <ChatBubbleMessage variant="sent" role="user">
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
                          <span>{_.startCase(part.toolName)} 🙋‍♀</span>
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

export default ChatMessage;
