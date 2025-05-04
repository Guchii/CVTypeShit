"use client";

import { BrainCog, DatabaseZap, Folders, LucideRefreshCcw } from "lucide-react";
import ChatInterface, { resetMessagesAtom } from "@/components/chat-interface";
import ResumePreview from "@/components/resume-preview";
import UserProfileSheet from "@/components/sheets/user-profile";
import LLMConfigSheet from "@/components/sheets/llm-config";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { atom, useAtom, useSetAtom } from "jotai";
import {
  filesSheetOpenAtom,
  llmSheetOpenAtom,
  userSheetOpenAtom,
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
import { Toaster } from "sonner";
import FilesSheet from "./sheets/files";

const resetMessagesAlertAtom = atom(false);

export default function Dashboard() {
  const [userSheetOpen, setUserSheetOpen] = useAtom(userSheetOpenAtom);
  const [llmSheetOpen, setLlmSheetOpen] = useAtom(llmSheetOpenAtom);
  const [filesSheetOpen, setFilesSheetOpen] = useAtom(filesSheetOpenAtom);
  const setResetMessagesAlert = useSetAtom(resetMessagesAlertAtom);

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex h-screen overflow-hidden bg-sidebar">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setUserSheetOpen(true)}
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
          </div>
          {/* Chat Interface */}
          <ChatInterface />
        </div>
        {/* Right side - Resume Preview */}
        <div className="w-[650px] relative p-6 grid place-items-center">
          <ResumePreview />
        </div>
        {/* Sheets */}
        <UserProfileSheet
          open={userSheetOpen}
          onOpenChange={setUserSheetOpen}
        />
        <LLMConfigSheet open={llmSheetOpen} onOpenChange={setLlmSheetOpen} />
        <FilesSheet open={filesSheetOpen} onOpenChange={setFilesSheetOpen} />
      </div>
      <ResetAlertDialog />
    </TooltipProvider>
  );
}

const ResetAlertDialog = () => {
  const resetMessages = useSetAtom(resetMessagesAtom);
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
          <AlertDialogAction onClick={() => resetMessages()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
