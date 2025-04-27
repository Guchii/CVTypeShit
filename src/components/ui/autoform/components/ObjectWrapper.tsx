import React, { useState } from "react";
import { ObjectWrapperProps } from "@autoform/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const ObjectWrapper: React.FC<ObjectWrapperProps> = ({
  label,
  children,
  field,
}) => {
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prev) => !prev);
  };
  const isOpen = open ? "rotate-180" : "rotate-0";
  const Label = label;
  console.log(field.key);
  const isAnArrayElement = field.key === "0";
  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <CollapsibleTrigger
        className={cn(
          "cursor-pointer flex items-center justify-between w-full",
          isAnArrayElement && "pr-8"
        )}
      >
        {Label}
        <ChevronDown
          className={cn("transition-transform duration-200", isOpen)}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 mt-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
  return null;
};
