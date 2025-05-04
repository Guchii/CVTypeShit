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
    return <ChatBubbleMessage role="user">{props.content}</ChatBubbleMessage>;
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
                    <strong className="flex items-center gap-2">
                      Tool Request
                      <span className="underline">
                        {_.startCase(part.toolName)}
                      </span>
                    </strong>
                    <img
                      width={16}
                      height={16}
                      src="https://emojicdn.elk.sh/🙋‍♀️"
                    />
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
      <div className="text-gray-500 text-sm">Tool Results</div>
      {_.isArray(props.content) &&
        props.content.map((part, i) => {
          return (
            <div className="flex items-center gap-2 not-prose" key={i}>
              <strong>{_.startCase(part.toolName)}</strong>
              <img width={16} height={16} src="https://emojicdn.elk.sh/✅" />
            </div>
          );
        })}
    </ChatBubbleMessage>
  );
}
//   <Markdown remarkPlugins={[remarkGfm]}>
//                     {typeof message.content === "string" ? message.content : ""}
//                   </Markdown>
//                   {message.role === "assistant" &&
//                     (_.isArray(message.content) ? message.content : []).map(
//                       (toolCall, index) => {
//                         if ("toolName" in toolCall) {
//                           return (
//                             <div
//                               className="flex items-center gap-2"
//                               key={index}
//                             >
//                               <strong>
//                                 <span className="underline">
//                                   {startCase(toolCall.toolName)}
//                                 </span>{" "}
//                                 Tool Request
//                               </strong>
//                               <img
//                                 width={16}
//                                 height={"auto"}
//                                 src="https://emojicdn.elk.sh/🙋‍♀️"
//                               />
//                             </div>
//                           );
//                         }
//                         return _.isString(message.content)
//                           ? message.content
//                           : "";
//                       }
//                     )}
//                   {message.role === "tool" &&
//                     message.content.map((toolResult, index) => {
//                       return (
//                         <div className="flex items-center gap-2" key={index}>
//                           <strong>{startCase(toolResult.toolName)}</strong>
//                           <img
//                             width={16}
//                             height={"auto"}
//                             src="https://emojicdn.elk.sh/✅"
//                           />
//                         </div>
//                       );
//                     })}

export default ChatMessage;
