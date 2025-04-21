import { $typst } from "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs";
import { sampleUserConfig } from "./content";

$typst.setCompilerInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
});
$typst.setRendererInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
});

export class TypstDocument {
  private typst: typeof $typst;
  private document: string;
  private observers: ((content: string) => void)[] = [];

  constructor(document: string) {
    this.typst = $typst;
    this.document = document;
    this.typst.mapShadow("/template.yml", new TextEncoder().encode(sampleUserConfig));
  }

  getContent(): string {
    return this.document;
  }

  async downloadDocument(): Promise<void> {
    const blob = new Blob([this.document], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async compileToPdf(): Promise<Uint8Array | undefined> {
    return await this.typst.pdf({ mainContent: this.document });
  }

  async compileToSVG(): Promise<string> {
    return await this.typst.svg({ mainContent: this.document });
  }

  updateDocument(newDocument: string): void {
    this.document = newDocument;
    this.observers.forEach((observer) => observer(this.document));
  }

  subscribeToChanges(observer: (content: string) => void): void {
    this.observers.push(observer);
  }

  unsubscribeFromChanges(observer: () => void): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }
}
