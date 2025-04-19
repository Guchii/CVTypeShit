"use client";

import { BrainCog, DatabaseZap } from "lucide-react";
import ChatInterface from "@/components/chat-interface";
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
import { useAtom } from "jotai";
import { llmSheetOpenAtom, userSheetOpenAtom } from "@/lib/atoms";

export default function Dashboard() {

  const [userSheetOpen, setUserSheetOpen] = useAtom(userSheetOpenAtom);
  const [llmSheetOpen, setLlmSheetOpen] = useAtom(llmSheetOpenAtom);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-dark-200">
        <div className="flex flex-col flex-1 border-r border-zinc-800 bg-dark-100">
          <div className="flex items-center justify-between p-4 border-b border-border">
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
            </div>
          </div>
          {/* Chat Interface */}
          <ChatInterface />
        </div>
        {/* Right side - Resume Preview */}
        <div className="w-[650px] bg-dark-300 p-6 grid place-items-center">
          <ResumePreview />
        </div>
        {/* Sheets */}
        <UserProfileSheet
          open={userSheetOpen}
          onOpenChange={setUserSheetOpen}
        />
        <LLMConfigSheet open={llmSheetOpen} onOpenChange={setLlmSheetOpen} />
      </div>
    </TooltipProvider>
  );
}
