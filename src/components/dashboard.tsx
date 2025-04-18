"use client";

import { useState } from "react";
import { BrainCog, Download } from "lucide-react";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/atoms";
import ChatInterface from "@/components/chat-interface";
import ResumePreview from "@/components/resume-preview";
import UserProfileSheet from "@/components/sheets/user-profile";
import LLMConfigSheet from "@/components/sheets/llm-config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function Dashboard() {
  const [userProfile] = useAtom(userAtom);

  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [llmSheetOpen, setLlmSheetOpen] = useState(false);

  const handleExportPDF = () => {
    // In a real app, this would use a library like jsPDF or react-pdf
    alert("Exporting resume as PDF...");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-dark-200">
        {/* Left side - Chat UI */}
        <div className="flex flex-col w-1/2 border-r border-zinc-800 bg-dark-100">
          {/* Header with interactive buttons */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUserSheetOpen(true)}
                  >
                    <Avatar>
                      <AvatarImage
                        src={userProfile.avatarUrl || "/placeholder.svg"}
                        alt={userProfile.name}
                      />
                      <AvatarFallback>
                        {getInitials(userProfile.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit User Profile</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setLlmSheetOpen(true)}
                    title="LLM Settings"
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
        <div className="relative w-1/2 bg-dark-300">
          <ResumePreview />
          {/* Export button */}
          <div className="absolute top-4 right-7">
            <Button onClick={handleExportPDF} variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
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
