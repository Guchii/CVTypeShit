import React from "react";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { ArrayElementWrapperProps } from "@autoform/react";

export const ArrayElementWrapper: React.FC<ArrayElementWrapperProps> = ({
  children,
  onRemove,
}) => {
  return (
    <div className="relative border p-2 rounded-md mt-2">
      <Button
        onClick={onRemove}
        type="button"
        variant={"default"}
        size="sm"
        className="ml-2 w-4 h-6 absolute top-2 right-2"
      >
        <TrashIcon className="h-1 w-1" />
      </Button>
      {children}
    </div>
  );
};
