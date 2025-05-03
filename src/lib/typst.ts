import { $typst } from "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs";
import { ToolSet } from "ai";
import { z, ZodSchema } from "zod";

$typst.setCompilerInitOptions({
  getModule: () => new URL("@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm", import.meta.url),
});

$typst.setRendererInitOptions({
  getModule: () =>
    new URL("@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm", import.meta.url)
});

type TypstFile = {
  path: string;
  content: string;
};

export class TypstDocument {
  private typst: typeof $typst;
  private observers: ((content: string) => void)[] = [];
  private filesContent: Map<string, string> = new Map();

  /**
   *
   * @param mainContent contents for the file /main.typ
   * @param files additional shadow files to be mapped in the typst compiler
   */
  constructor(private mainContent: string, files: TypstFile[]) {
    this.typst = $typst;
    files.map((file) => {
      this.filesContent.set(file.path, file.content);
      this.typst.mapShadow(file.path, new TextEncoder().encode(file.content));
    });
    console.log(this)
  }

  getContent(): string {
    return this.mainContent;
  }

  getFile(path: string): string {
    if (this.filesContent.has(path)) {
      return this.filesContent.get(path) as string;
    }
    throw new Error(`File ${path} not found`);
  }

  async compileToPdf(): Promise<Uint8Array | undefined> {
    return await this.typst.pdf({ mainContent: this.mainContent });
  }

  async compileToSVG(): Promise<string> {
    return await this.typst.svg({ mainContent: this.mainContent });
  }

  updateDocument(newDocument: string): void {
    this.mainContent = newDocument;
    this.observers.forEach((observer) => observer(this.mainContent));
  }

  private updateFileContent(path: string, newContent: string): void {
    this.typst.unmapShadow(path);
    this.typst.mapShadow(path, new TextEncoder().encode(newContent));
  }

  async updateFile(path: string, newContent: string) {
    const oldContent = this.filesContent.get(path);
    this.updateFileContent(path, newContent);
    try {
      await this.compileToSVG()
      this.observers.forEach((observer) => observer(this.mainContent));
    } catch (e) {
      this.updateFileContent(path, oldContent as string);
      throw new Error(
        `Error updating file ${path}: ${e}. The file has been reverted to its previous state.`
      );
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
