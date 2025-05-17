import { $typst } from "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs";
import { ToolSet } from "ai";
import { z, ZodSchema } from "zod";
import FS from "@isomorphic-git/lightning-fs";
import { InitOptions } from "@myriaddreamin/typst.ts/dist/esm/options.init.mjs";
import { logger } from "./consola";
import { BuildFailedError } from "./errors";
type TypstFile = {
  path: string;
  content: string;
};

export type CompilerInitOptions = {
  compiler: Partial<InitOptions>;
  renderer: Partial<InitOptions>;
};

const defaultCompilerOptions: CompilerInitOptions = {
  compiler: {
    getModule: () =>
      new URL(
        "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
        import.meta.url
      ),
  },
  renderer: {
    getModule: () =>
      new URL(
        "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
        import.meta.url
      ),
  },
};

export const indexedDBStore = "resume-bandhuu";

export class BaseTypstDocument {
  public typst: typeof $typst;
  private observers: ((content: string) => void)[] = [];
  private mainContent: string = "";
  public fs: FS;

  /**
   *
   * @param mainContent contents for the file /main.typ
   * @param files additional shadow files to be mapped in the typst compiler
   */
  constructor(
    mainContent: string,
    files: TypstFile[],
    compilerInitOptions: CompilerInitOptions = defaultCompilerOptions
  ) {
    logger.start(BaseTypstDocument.name);

    $typst.setCompilerInitOptions(compilerInitOptions.compiler);
    $typst.setRendererInitOptions(compilerInitOptions.renderer);

    this.typst = $typst;

    this.fs = new FS(indexedDBStore);

    this.fs.readFile("/main.typ", { encoding: "utf8" }, (e, data) => {
      logger.ready("/main.typ");
      if (e) {
        this.mainContent = mainContent;
        this.fs.writeFile(
          "/main.typ",
          mainContent,
          { encoding: "utf8", mode: 0o777 },
          () => {}
        );
      }
      if (data) {
        this.mainContent = data;
      }
    });

    // Map other files
    files.forEach((file) => {
      this.fs.readFile(file.path, { encoding: "utf8" }, (e, data) => {
        logger.ready(file.path);
        if (e) {
          logger.log(`Error reading file ${file.path}: ${e}`);
          this.fs.writeFile(
            file.path,
            file.content,
            { encoding: "utf8", mode: 0o777 },
            async () => {
              await this.typst.mapShadow(
                file.path,
                new TextEncoder().encode(file.content)
              );
            }
          );
        }
        if (data) {
          this.fs.writeFile(
            file.path,
            data,
            { encoding: "utf8", mode: 0o777 },
            async () => {
              logger.debug(`${file.path} written to storage`);
              logger.start(`shadow mapping ${file.path}`);
              await this.typst.mapShadow(file.path, new TextEncoder().encode(data));
            }
          );
        }
      });
    });
  }

  getContent(): string {
    return this.mainContent;
  }

  async getFile(path: string): Promise<string> {
    const fileContent = await this.fs.promises.readFile(path, {
      encoding: "utf8",
    });
    return fileContent;
  }

  async compileToPdf(): Promise<Uint8Array | undefined> {
    return await this.typst.pdf({ mainContent: this.mainContent });
  }

  async compileToSVG(): Promise<string> {
    logger.start(this.compileToSVG.name);
    return await this.typst.svg({ mainContent: this.mainContent });
  }

  async updateDocument(newDocument: string) {
    await this.fs.promises.writeFile("/main.typ", newDocument, {
      encoding: "utf8",
      mode: 0o777,
    });
    this.mainContent = newDocument;
    this.observers.forEach((observer) => observer(this.mainContent));
  }

  private async updateFileContent(path: string, newContent: string) {
    await this.fs.promises.writeFile(path, newContent, {
      encoding: "utf8",
      mode: 0o777,
    });
    await this.typst.unmapShadow(path);
    await this.typst.mapShadow(path, new TextEncoder().encode(newContent));
  }

  async updateFile(path: string, newContent: string) {
    const oldContent = await this.fs.promises.readFile(path, {
      encoding: "utf8",
    });
    await this.updateFileContent(path, newContent);
    try {
      logger.start("Build Check");
      await this.compileToSVG();
      this.observers.forEach((observer) => observer(this.mainContent));
    } catch (e) {
      await this.updateFileContent(path, oldContent as string);
      throw new BuildFailedError(path, e)
    }
  }

  subscribeToChanges(observer: (content: string) => void): void {
    this.observers.push(observer);
  }

  unsubscribeFromChanges(observer: () => void): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  getTools(): ToolSet {
    return {};
  }

  getDataSchema(): ZodSchema {
    return z.object({});
  }
}
