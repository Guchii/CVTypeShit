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

  const updateContent = useCallback(async () => {
    const svg = await typstDocument.compileToSVG();
    if (contentRef.current) {
      contentRef.current.innerHTML = svg;
    }
  }, [typstDocument]);

  useEffect(() => {
    typstDocument.subscribeToChanges(updateContent);
  }, [typstDocument, updateContent]);

  useEffect(() => {
    typstDocument.fetchTemplateAndData().then(() => {
      updateContent();
    });
  }, [typstDocument, updateContent]);

  return (
    <div className="h-[90%] w-full bg-white overflow-auto my-4 rounded-lg shadow-xl max-w-3xl mx-auto border border-zinc-200">
      <div ref={contentRef} className="w-full bg-white [&>svg]:w-full" />
      <div className="fixed top-0 right-0">
        {/* <Button
          className="hover:scale-125 origin-top-right ease-[cubic-bezier(0.85,0,0.15,1)] duration-300"
          variant="default"
          size="sm"
        >
          <Rows4 className="h-4 w-4 mr-2" />
          Configure Sections
        </Button> */}
        <Button
          onClick={handleExportPDF}
          className="hover:scale-125 origin-top-right ease-[cubic-bezier(0.85,0,0.15,1)] duration-300"
          variant="default"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}

export default React.memo(ResumePreview);
