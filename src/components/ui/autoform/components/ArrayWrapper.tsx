import React, { useState } from "react";
import { ArrayWrapperProps } from "@autoform/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../../button";

export const ArrayWrapper: React.FC<ArrayWrapperProps> = ({
  label,
  children,
  onAddItem,
}) => {
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prev) => !prev);
  };
  const isOpen = open ? "rotate-180" : "rotate-0";
  const Label = label || "Expand Item";
  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <CollapsibleTrigger className="cursor-pointer flex items-center justify-between w-full">
        <span className="flex items-center gap-2">
          {Label}
          <div
            onClick={(e) => {
              if (open) e.stopPropagation();
              onAddItem();
            }}
            className={cn(
              "ml-2",
              buttonVariants({ variant: "default", size: "sm" })
            )}
          >
            <PlusIcon className="h-1 w-1" />
          </div>
        </span>
        <ChevronDown
          className={cn("transition-transform duration-200", isOpen)}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 mt-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};
