"use client";

import ChatInterface from "@/components/chat/interface";
import ResumePreview from "@/components/resume-preview";
import UserProfileSheet from "@/components/sheets/user-profile";
import LLMConfigSheet from "@/components/sheets/llm-config";
import { TooltipProvider } from "./ui/tooltip";
import { useAtom, useAtomValue } from "jotai";
import {
  filesSheetOpenAtom,
  llmSheetOpenAtom,
  userSheetOpenAtom,
} from "@/lib/atoms";
import { Toaster } from "sonner";
import FilesSheet from "./sheets/files";
import HeaderBar, {
  ResetAlertDialog,
  resetMessagesAlertAtom,
} from "./dashboard/header-bar";
import { cn } from "@/lib/utils";
import AppLoader from "./app-loader";

export default function Layout() {
  const [userSheetOpen, setUserSheetOpen] = useAtom(userSheetOpenAtom);
  const [llmSheetOpen, setLlmSheetOpen] = useAtom(llmSheetOpenAtom);
  const [filesSheetOpen, setFilesSheetOpen] = useAtom(filesSheetOpenAtom);
  const resetMessageAlertOpen = useAtomValue(resetMessagesAlertAtom);

  const anySheetOpen =
    userSheetOpen || llmSheetOpen || filesSheetOpen || resetMessageAlertOpen;

  return (
    <TooltipProvider>
      <Toaster
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
          } as React.CSSProperties
        }
        icons={{
          close: null,
          error: null,
          info: null,
          loading: null,
          success: null,
          warning: null
        }}
      />
      <div
        className={cn(
          "flex h-screen overflow-hidden bg-sidebar transition-all ease-[cubic-bezier(0.85,0,0.15,1)]",
          anySheetOpen && "p-32"
        )}
      >
        <AppLoader />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex absolute left-0 top-0 items-center justify-between px-6 py-4 z-[var(--z-header-bar)]">
            <HeaderBar />
          </div>
          <ChatInterface />
        </div>
        <div className="bg-sidebar relative p-6 grid place-items-center">
          <ResumePreview />
        </div>
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
