import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Download, Eye } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { documentAtom, eyeSaverModeAtom, typstLoadedAtom, appLoadingAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/consola";

function ResumePreview() {
  const typstDocument = useAtomValue(documentAtom);
  const setLoaded = useSetAtom(typstLoadedAtom);
  const [appLoading, setAppLoading] = useAtom(appLoadingAtom);

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
    logger.debug("Content Updated Compiling to SVG", "resume-preview");
    const svg = await typstDocument.compileToSVG();
    if (contentRef.current) {
      contentRef.current.innerHTML = svg;
    }
  }, [typstDocument]);

  useEffect(() => {
    typstDocument.subscribeToChanges(updateContent);
  }, [typstDocument, updateContent]);

  useEffect(() => {
    typstDocument.fetchTemplateAndData();
  }, [typstDocument, updateContent]);

  useEffect(() => {
    if (!typstDocument.isTypstLoaded) {
      typstDocument.beforeLoadQueue.push(() => setAppLoading(true));
      typstDocument.afterLoadQueue.push(() => {
        setLoaded(true);
        setAppLoading(false);
      })
    }
  }, [typstDocument, setLoaded])

  const [eyeSaverMode, setEyeSaverMode] = useAtom(eyeSaverModeAtom);

  return (
    <div className="h-[87%] w-full bg-transparent overflow-auto my-4 max-w-3xl mx-auto">
      <div
        ref={contentRef}
        className={cn(
          "w-full [&>svg]:w-full bg-white border border-white h-full overflow-auto rounded-lg",
          eyeSaverMode &&
            "bg-transparent [&>svg_use]:fill-white [&>svg_path]:stroke-white"
        )}
      >
        <div
          className={cn(
            "prose prose-headings:text-background text-background p-32",
            eyeSaverMode && "text-foreground prose-headings:text-foreground"
          )}
        >
          {!typstDocument.isTypstLoaded && !appLoading ? (
            <div className="flex flex-col gap-2 items-center h-full w-full justify-center">
              <Button onClick={() => typstDocument.loadTypst()}>
                Load Compiler (7.5MB)
              </Button>
            </div>
          ) : (
            <div>
              <h1>Loading Compiler....</h1>
            </div>
          )}
        </div>
      </div>
      <div className="fixed top-0 right-0 z-[var(--z-header-bar)]">
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
