"use client";

import { BrainCog, DatabaseZap, Folders, LucideRefreshCcw } from "lucide-react";
import { resetMessagesAtom } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  documentAtom,
  filesSheetOpenAtom,
  llmSheetOpenAtom,
  userSheetOpenAtom,
  typstLoadedAtom
} from "@/lib/atoms";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const resetMessagesAlertAtom = atom(false);
export default function HeaderBar() {
  const setUserSheetOpen = useSetAtom(userSheetOpenAtom);
  const setLlmSheetOpen = useSetAtom(llmSheetOpenAtom);
  const setFilesSheetOpen = useSetAtom(filesSheetOpenAtom);
  const setResetMessagesAlert = useSetAtom(resetMessagesAlertAtom);
  const typstLoaded = useAtomValue(typstLoadedAtom);
  return (
    <div className="flex items-center gap-2 [&_button]:bg-sidebar">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setUserSheetOpen(true)}
            disabled={!typstLoaded}
          >
            <DatabaseZap className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Data</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLlmSheetOpen(true)}
          >
            <BrainCog className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>LLM Settings</TooltipContent>
      </Tooltip>
      {import.meta.env.DEV && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFilesSheetOpen(true)}
            >
              <Folders className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Files</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setResetMessagesAlert(true)}
            variant="outline"
            size="icon"
          >
            <LucideRefreshCcw className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Start Over</TooltipContent>
      </Tooltip>
    </div>
  );
}
export const ResetAlertDialog = () => {
  const resetMessages = useSetAtom(resetMessagesAtom);
  const typstDocument = useAtomValue(documentAtom);
  const [resetMessagesAlert, setResetMessagesAlert] = useAtom(
    resetMessagesAlertAtom
  );

  return (
    <AlertDialog open={resetMessagesAlert} onOpenChange={setResetMessagesAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            progress
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => {
            await typstDocument.fetchTemplateAndData();
            resetMessages();
          }}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
