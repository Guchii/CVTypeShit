import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Eye } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  documentAtom,
  eyeSaverModeAtom,
  typstLoadedAtom,
  appLoadingAtom,
} from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/consola";
import compilerURL from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";
import rendererURL from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import flowers from "@/../public/flowers.svg?raw";

const timeout = 4;

function ResumePreview() {
  const typstDocument = useAtomValue(documentAtom);
  const setLoaded = useSetAtom(typstLoadedAtom);
  const [appLoading, setAppLoading] = useAtom(appLoadingAtom);

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    (async () => {
      const ac = new AbortController();
      const promise = fetch(compilerURL, { signal: ac.signal })
        .then(() => true)
        .catch(() => false);

      const ac2 = new AbortController();
      const promise2 = fetch(rendererURL, { signal: ac2.signal })
        .then(() => true)
        .catch(() => false);

      setTimeout(() => ac.abort(), timeout);
      setTimeout(() => ac2.abort(), timeout);
      return Promise.all([promise, promise2]);
    })().then((cached) => {
      if (cached.every((val) => val)) {
        typstDocument.loadTypst();
      }
    });
  }, []);

  const updateContent = useCallback(async () => {
    logger.debug("Content Updated Compiling to SVG", "resume-preview");
    const svg = await typstDocument.compileToSVG();
    if (contentRef.current) {
      contentRef.current.innerHTML = svg;
    }
  }, [typstDocument]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = flowers;
    }
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
      });
    }
  }, [typstDocument, setLoaded]);

  const [eyeSaverMode, setEyeSaverMode] = useAtom(eyeSaverModeAtom);

  return (
    <div className="h-[87%] w-full bg-transparent relative overflow-auto my-4 max-w-3xl mx-auto">
      <div
        ref={contentRef}
        className={cn(
          "w-full [&>svg]:w-full [&>svg#flower]:scale-[2.2] bg-white border border-white h-full overflow-auto rounded-lg",
          eyeSaverMode &&
            "bg-transparent [&>svg_use]:fill-white [&>svg_path]:stroke-white",
          !typstDocument.isTypstLoaded && "overflow-hidden"
        )}
      />
      <div
        className={cn(
          "left-1/2 top-1/2 absolute -translate-x-[50%] -translate-y-[50%]",
          "prose prose-headings:text-background text-background p-32",
          eyeSaverMode && "text-foreground prose-headings:text-foreground"
        )}
      >
        {!typstDocument.isTypstLoaded && (
          <div className="flex flex-col gap-2 items-center h-full w-full justify-center">
            <Button disabled={appLoading} size={"lg"} onClick={() => typstDocument.loadTypst()}>
              {appLoading ? (
                "Loading Compiler"
              ) : (
              "Load Compiler (7.5MB)"
              )}
            </Button>
          </div>
        )}
      </div>
      {!typstDocument.isTypstLoaded && (
        <FlowerCredits/>
      )}
      <div className="fixed top-4 right-6 z-[var(--z-header-bar)]">
        <Button
          onClick={() => setEyeSaverMode((prev) => !prev)}
          variant="outline"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          {eyeSaverMode ? "Disable Eye Saver" : "Enable Eye Saver"}
        </Button>
      </div>
    </div>
  );
}

function FlowerCredits() {
  return (
    <div className="absolute bottom-0 p-3 text-xs right-0 border border-white rounded-lg flex flex-col items-end bg-black text-white">
      <span>These Flowers are Created by Kristina Margaryan</span>
      <span>from the Noun Project</span>
    </div>
  );
}

export default React.memo(ResumePreview);
