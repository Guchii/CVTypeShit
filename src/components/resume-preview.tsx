import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Eye, MapPin } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  documentAtom,
  eyeSaverModeAtom,
  typstLoadedAtom,
  appLoadingAtom,
} from "@/lib/atoms";
import { cn } from "@/lib/utils";
import compilerURL from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";
import rendererURL from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import flowers from "@/assets/flowers.svg?raw";

const timeout = 4;

const parser = new DOMParser();

function countPages(svgString: string) {
  const document = parser.parseFromString(svgString, "image/svg+xml");
  return document.querySelectorAll(".typst-page").length;
}

function ResumePreview() {
  const typstDocument = useAtomValue(documentAtom);
  const setLoaded = useSetAtom(typstLoadedAtom);
  const [appLoading, setAppLoading] = useAtom(appLoadingAtom);
  const [pageCount, setPageCount] = useState<number>(1);

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
    const svg = await typstDocument.compileToSVG();
    setPageCount(countPages(svg));

    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.innerHTML = svg;
      }
    }, 10);
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
  console.log({ pageCount });
  return (
    <div className="h-[90%] w-auto bg-transparent aspect-[1224/1584] relative overflow-auto my-4 max-w-3xl mx-auto">
      <div
        ref={contentRef}
        style={
          {
            "--svg-height-relative-to-container": `${pageCount * 100}%`,
          } as CSSProperties
        }
        className={cn(
          "w-full [&>svg]:w-full [&>svg]:h-[var(--svg-height-relative-to-container)] [&>svg#flower]:scale-[2.2] bg-white border border-white h-full overflow-auto rounded-lg",
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
            <Button
              disabled={appLoading}
              size={"lg"}
              onClick={() => typstDocument.loadTypst()}
            >
              {appLoading ? "Loading Compiler" : "Load Compiler (7.5MB)"}
            </Button>
          </div>
        )}
      </div>
      {!typstDocument.isTypstLoaded && <FlowerCredits />}
      <div className="fixed top-4 flex gap-2 items-center right-6 z-[var(--z-header-bar)]">
        <Button
          onClick={() => setEyeSaverMode((prev) => !prev)}
          variant="outline"
          size="sm"
        >
          <Eye className="h-4 w-4" />
          {eyeSaverMode ? "Disable Eye Saver" : "Enable Eye Saver"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => typstDocument.createCheckpoint().then(() => typstDocument.getCheckpoints())}
        >
          <MapPin className="h-4 w-4" />
          Create Checkpoint
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
