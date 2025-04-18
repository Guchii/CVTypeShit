import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useAtomValue } from "jotai";
import { documentAtom } from "@/lib/atoms";

function ResumePreview() {
  const typstDocument = useAtomValue(documentAtom);

  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const updateContent = async () => {
      const svg = await typstDocument.compileToSVG();
      if (contentRef.current) {
        contentRef.current.innerHTML = svg;
      }
    };
    updateContent();
    typstDocument.subscribeToChanges(updateContent);
  }, []);

  return (
    <div className="h-[calc(100vh-32px)] bg-white overflow-auto my-4 rounded-lg shadow-xl max-w-3xl mx-auto border border-zinc-200">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"></h1>
      <div ref={contentRef} className="w-full bg-white [&>svg]:w-full" />
      <div className="fixed top-0 right-0">
        <Button onClick={handleExportPDF} variant="default" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}

export default React.memo(ResumePreview);
