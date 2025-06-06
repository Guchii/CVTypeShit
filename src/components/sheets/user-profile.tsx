/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { atom, useAtomValue } from "jotai";
import { documentAtom } from "@/lib/atoms";
import { Button } from "../ui/button";
import _ from "lodash";
import { toast } from "sonner";
import { Control } from "react-hook-form";
import { ImportResume } from "@/lib/import-resume";
import { logger } from "@/lib/consola";

type UserProfileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const importResumeAtom = atom<ImportResume | null>(null);

export const triggerImportResumeAtom = atom(null, (get, set) => {
  let importResume = get(importResumeAtom);
  if (importResume) {
    importResume.triggerImportResume();
    return;
  }
  importResume = new ImportResume();
  set(importResumeAtom, importResume);
});

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
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (!_.isEmpty(formControl.current?._formState.dirtyFields)) {
            toast.info("Anna you have unsaved changes");
            e.preventDefault();
          }
        }}
        side="left"
        className="max-w-[540px] border-zinc-800 sm:max-w-[640px] md:max-w-[720px]" // Increased width
      >
        <SheetHeader className="p-4">
          <SheetTitle className="text-4xl">Resume Data</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Fill in your details to create a personalized resume. You can chat
            with AI to update this data.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-280px)] px-4">
          <AutoForm
            formProps={{
              noValidate: true,
              id: "user-profile-form",
            }}
            onFormInit={(form) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              form.reset(activeDocument.data);
              formControl.current = form.control;
            }}
            onSubmit={(data) => {
              try {
                onOpenChange(false);
                // TODO: This is a hack to wait for the document to be updated
                // we should make the the doc compilation not block the thread
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(null);
                  }, 500);
                }).then(() => {
                  //@ts-expect-error
                  activeDocument.data = data;
                });
              } catch (error) {
                toast.error("Failed to update resume data", {
                  description: _.isError(error)
                    ? error.message
                    : "Unknown error",
                });
                logger.error(error);
              }
            }}
            schema={schemaProvider}
          />
        </ScrollArea>
        <SheetFooter className="flex justify-end p-6">
          <Button variant={"outline"} type="submit" form="user-profile-form">
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
