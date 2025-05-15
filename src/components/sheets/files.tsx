import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { documentAtom } from "@/lib/atoms";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Eye, RefreshCcw } from "lucide-react";
import { messagesAtom } from '@/hooks/use-chat';

type LLMConfigSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FilesSheet({
  open,
  onOpenChange,
}: LLMConfigSheetProps) {
  const document = useAtomValue(documentAtom);
  const [files, setFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const messages = useAtomValue(messagesAtom);

  const displayMessages = useCallback(() => {
    setActiveFile(JSON.stringify(messages.filter(m => m.role !== "system"), null, 2)); 
  }, [messages]);

  const getFiles = useCallback(async () => {
    const files = await document.fs.promises.readdir("/");
    setFiles(files);
    return files;
  }, [document]);

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[400px] gap-0 sm:w-[540px] border-zinc-800"
      >
        <SheetHeader className="p-4">
          <SheetTitle className="text-4xl">
            Files
            <Button
              variant="outline"
              size="icon"
              onClick={getFiles}
              className="ml-2"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={displayMessages}
              className="ml-2"
            >
              Display Messages JSON
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 p-4">
          {files.map((file) => (
            <div key={file} className="flex items-center justify-between">
              <Label>{file}</Label>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  console.log(`Opening file: ${file}`);
                  document.fs.promises
                    .readFile(`/${file}`, { encoding: "utf8" })
                    .then((data) => {
                      setActiveFile(data);
                    });
                }}
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          ))}
          {activeFile && (
            <code className="h-80 overflow-auto bg-dark-200 p-2 rounded-md">
              <pre>{activeFile}</pre>
            </code>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
