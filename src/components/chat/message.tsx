import { CoreAssistantMessage, CoreMessage, CoreUserMessage } from "ai";
import { ChatBubble, ChatBubbleMessage } from "../ui/chat/chat-bubble";
import _ from "lodash";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      <ChatBubbleMessage
      style={{
        boxShadow: "5px 5px 0 1px #ffffff30",
      }}
      variant="sent" role="user">
        {props.content}
      </ChatBubbleMessage>
    );
  }
}

function AssistantMessage(props: CoreAssistantMessage) {
  return (
    <ChatBubbleMessage
      style={{
        boxShadow: "-5px 5px 0 1px #ffffff30",
      }}
    role="assistant">
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
              default:
                return null;
            }
          })}
      </div>
    </ChatBubbleMessage>
  );
}

export default ChatMessage;
