import React, {
  CSSProperties,
  Fragment,
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
  isReadyToCompileAtom,
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
async function checkForCache() {
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
  const [cachedCompiler, cachedRenderer] = await Promise.all([
    promise,
    promise2,
  ]);
  return cachedCompiler && cachedRenderer;
}

function ResumePreview() {
  const typstDocument = useAtomValue(documentAtom);
  const setLoaded = useSetAtom(isReadyToCompileAtom);
  const [appLoading, setAppLoading] = useAtom(appLoadingAtom);
  const [isReadyToLoad, setIsReadyToLoad] = useState(false);
  const [pageCount, setPageCount] = useState<number>(1);

  const contentRef = useRef<HTMLDivElement>(null);

  const renderResume = useCallback(async () => {
    const svg = await typstDocument.compileToSVG();
    setPageCount(countPages(svg));

    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.innerHTML = svg;
      }
    }, 0);
  }, [typstDocument]);

  useEffect(() => {
    typstDocument.init();
    return () => {
      typstDocument.destroy();
    }
  }, [typstDocument]);

  useEffect(() => {
    checkForCache().then((cached) => {
      if (cached) {
        typstDocument.loadTypst();
      }
    });
  }, [typstDocument]);

  useEffect(() => {
    const afterIsReadyToCompile = () => {
      setAppLoading(false);
      setLoaded(true);
      renderResume();
    };

    const beforeLoad = () => {
      setAppLoading(true);
    };

    const afterIsReadyToLoad = () => {
      setIsReadyToLoad(true);
    }

    typstDocument.beforeLoadQueue.enqueue(beforeLoad);
    typstDocument.afterIsReadyToCompile.enqueue(afterIsReadyToCompile);
    typstDocument.afterIsReadyToLoad.enqueue(afterIsReadyToLoad);


    return () => {
      typstDocument.beforeLoadQueue.dequeue(beforeLoad);
      typstDocument.afterIsReadyToCompile.dequeue(afterIsReadyToCompile);
    };
  }, [typstDocument, setAppLoading, setLoaded, renderResume]);


  useEffect(() => {
    const container = contentRef.current;
    if (container) {
      container.innerHTML = flowers;
    }

    typstDocument.subscribeToChanges(renderResume);
    return () => {
      if (container) {
        container.innerHTML = "<span>Cleanup</span>";
      }
      typstDocument.unsubscribeFromChanges(renderResume);
    };
  }, [typstDocument, renderResume]);

  const [eyeSaverMode, setEyeSaverMode] = useAtom(eyeSaverModeAtom);

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
          !typstDocument.isReadyToCompile && "overflow-hidden"
        )}
      />
      {!typstDocument.isReadyToCompile && (
        <Fragment>
          <div
            className={cn(
              "left-1/2 top-1/2 absolute -translate-x-[50%] -translate-y-[50%]",
              "prose prose-headings:text-background text-background p-32",
              eyeSaverMode && "text-foreground prose-headings:text-foreground"
            )}
          >
            {isReadyToLoad && (
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
          <FlowerCredits />
        </Fragment>
      )}
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
          onClick={() => typstDocument.createCheckpoint()}
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
