import { toolsBus } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { EyeIcon, PencilIcon } from "lucide-react";
import { FunctionComponent, useEffect, useState } from "react";

interface ToolCallProps {
  query?: string;
  toolName?: "query" | "mutate";
  toolCallId?: string
}

const getQueryText = (path: string) => {
  const segments = path.split('.').filter(s => s)
  return segments.join(" > ");
}

const ToolCall: FunctionComponent<ToolCallProps> = ({
  query = ".personal.name",
  toolName = "mutate",
  toolCallId
}) => {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (toolCallId && !completed) {
      toolsBus.subscribe(toolCallId, async () => {
         setCompleted(true)
      }, )
    }
  }, [toolCallId, completed])

  const Icon = toolName.includes("query") ? EyeIcon : PencilIcon;

  let action: string;

  switch (toolName) {
    case "query":
      action = completed ? "read" : "reading";
      break;
    default:
    case "mutate":
      action = completed ? "updated" : "updating";
  }

  const finalText = `${action} ${getQueryText(query)}`

  return (
      <div className={cn("flex gap-2 items-center", !completed && "animate-pulse")}>
        <Icon size={16} style={{
          position: "relative",
          top: 1
        }}/> {finalText}
      </div>
  );
};

export default ToolCall;
