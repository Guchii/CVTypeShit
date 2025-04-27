import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useAtomValue } from "jotai";
import { documentAtom } from "@/lib/atoms";
import { Template1 } from "@/lib/template-1";

const fetchTemplateAndData = async (document: Template1) => {
  const templateResponse = await fetch("/templates/template-1/main.typ");
  let templateText = await templateResponse.text();
  if (templateText) {
    const regex = /(#let cvdata = yaml\(")\.\//g;
    templateText = templateText.replace(regex, "$1/");
  }

  const dataResponse = await fetch("/templates/template-1/template.yml");
  const dataText = await dataResponse.text();

  document.updateDocument(templateText);
  document.replaceData(dataText);
};

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

  useEffect(() => {
    console.log("Fetching template and data");
    if (typstDocument instanceof Template1) {
      fetchTemplateAndData(typstDocument);
    }
    return () => {
      typstDocument.updateDocument("");
      typstDocument.updateFile("/template.yml", "");
    };
  }, [typstDocument]);

  return (
    <div className="h-fit bg-white overflow-auto my-4 rounded-lg shadow-xl max-w-3xl mx-auto border border-zinc-200">
      <div ref={contentRef} className="w-full bg-white [&>svg]:w-full" />
      <div className="fixed top-0 right-0">
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
