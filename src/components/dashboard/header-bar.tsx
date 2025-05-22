"use client";

import {
  BrainCog,
  DatabaseZap,
  DownloadIcon,
  Folders,
  LucideRefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  filesSheetOpenAtom,
  llmSheetOpenAtom,
  userSheetOpenAtom,
  typstLoadedAtom,
  documentAtom,
  appLoadingAtom,
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
import { BaseTypstDocument } from "@/lib/base-typst";
import { toast } from "sonner";

export const resetMessagesAlertAtom = atom(false);

export default function HeaderBar() {
  const typstDocument = useAtomValue(documentAtom);
  const setUserSheetOpen = useSetAtom(userSheetOpenAtom);
  const setLlmSheetOpen = useSetAtom(llmSheetOpenAtom);
  const setFilesSheetOpen = useSetAtom(filesSheetOpenAtom);
  const setResetMessagesAlert = useSetAtom(resetMessagesAlertAtom);
  const typstLoaded = useAtomValue(typstLoadedAtom);

  const handleExportPDF = useCallback(async () => {
    const pdf = await typstDocument.compileToPdf();
    if (pdf) {
      const blob = new Blob([pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, []);

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
            onClick={() => handleExportPDF()}
            disabled={!typstLoaded}
          >
            <DownloadIcon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download PDF</TooltipContent>
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
  const [resetMessagesAlert, setResetMessagesAlert] = useAtom(
    resetMessagesAlertAtom
  );
  const setAppLoading = useSetAtom(appLoadingAtom);

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
          <AlertDialogAction
            onClick={async () => {
              setAppLoading(true)
              localStorage.removeItem("messages");
              await BaseTypstDocument.resetDocument();
              toast.info("Reloading in 3 seconds");
              setTimeout(() => location.reload(), 3000);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
