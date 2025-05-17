import { cn } from "@/lib/utils";
import { EyeIcon, PencilIcon } from "lucide-react";
import { FunctionComponent } from "react";

interface ToolCallProps {
  query?: string;
  toolName?: "query" | "mutate";
  completed?: boolean
}

const ToolCall: FunctionComponent<ToolCallProps> = ({
  query = ".personal.name",
  toolName = "mutate",
  completed = false
}) => {
  const icon = toolName.includes("query") ? <EyeIcon /> : <PencilIcon />;
  return (
    <div>
      <div className={cn("flex gap-2 items-center", !completed && "animate-pulse")}>
        {icon} {query}
      </div>
    </div>
  );
};

export default ToolCall;
