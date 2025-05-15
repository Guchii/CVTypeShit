import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Download, Eye } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { documentAtom, eyeSaverModeAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";

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
    typstDocument.fetchTemplateAndData()
  }, [typstDocument, updateContent]);
  const [eyeSaverMode, setEyeSaverMode] = useAtom(eyeSaverModeAtom);

  return (
    <div className="h-[87%] w-full bg-transparent overflow-auto my-4 rounded-lg max-w-3xl mx-auto">
      <div
        ref={contentRef}
        className={cn(
          "w-full [&>svg]:w-full bg-white border border-white h-full overflow-auto",
          eyeSaverMode &&
            "bg-transparent [&>svg_use]:fill-white [&>svg_path]:stroke-white"
        )}
      >
        <div className="prose prose-headings:text-foreground text-foreground p-32">
          <h1>LOADING IG....</h1>
          <p>Try refreshing if you're stuck at this state</p>
        </div>
      </div>
      <div className="fixed top-0 right-0">
        <Button
          onClick={() => setEyeSaverMode((prev) => !prev)}
          variant="default"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          {eyeSaverMode ? "Disable Eye Saver" : "Enable Eye Saver"}
        </Button>
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
