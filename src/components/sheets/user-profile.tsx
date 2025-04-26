"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutoForm } from "../ui/autoform";
import { ZodProvider } from "@autoform/zod";
import { useMemo, useRef } from "react";
import { useAtomValue } from "jotai";
import { documentAtom } from "@/lib/atoms";
import { Button } from "../ui/button";
import { Template1 } from "@/lib/template-1";
import _ from "lodash";
import { toast } from "sonner";
import { Control } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Dice3, Import } from "lucide-react";

type UserProfileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UserProfileSheet({
  open,
  onOpenChange,
}: UserProfileSheetProps) {
  const activeDocument = useAtomValue(documentAtom);
  const formControl =
    useRef<Control<Record<string, never>, never, undefined | null>>(null);
  const schemaProvider = useMemo(() => {
    const schema = activeDocument.getDataSchema();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    return new ZodProvider(schema);
  }, [activeDocument]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onPointerDownOutside={(e) => {
          if (formControl.current?._getDirty())
          {
            toast.success("Anna you have unsaved changes");
            e.preventDefault();
          }
        }}
        side="left"
        className="max-w-[540px] border-zinc-800 sm:max-w-[640px] md:max-w-[720px]" // Increased width
      >
        <SheetHeader className="p-4 bg-background">
          <SheetTitle className="text-4xl">Resume Data</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Fill in your details to create a personalized resume. You can chat
            with AI to update this data.
          </SheetDescription>
          <div className="flex items-center gap-2 mt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled variant="outline" size="icon">
                  <Import className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import Existing Resume</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled variant="outline" size="icon">
                  <Dice3 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Randomize Data</TooltipContent>
            </Tooltip>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-280px)] px-4">
          <AutoForm
            formProps={{
              noValidate: true,
              id: "user-profile-form",
            }}
            onFormInit={(form) => {
              if (activeDocument instanceof Template1) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                form.reset(activeDocument.data);
                formControl.current = form.control;
                console.log(form.control);
              }
            }}
            onSubmit={(data) => {
              try {
                if (activeDocument instanceof Template1) {
                  const resumeData = activeDocument.data;
                  activeDocument.data = _.merge(resumeData, data);
                  onOpenChange(false);
                }
              } catch (error) {
                console.error("Error updating document data:", error);
                toast.error("Failed to update resume data.");
              }
            }}
            schema={schemaProvider}
          />
        </ScrollArea>
        <SheetFooter className="flex justify-end p-6 bg-background">
          <Button type="submit" form="user-profile-form">
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
