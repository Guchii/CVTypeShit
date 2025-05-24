import { $typst } from "@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs";
import FS from "@isomorphic-git/lightning-fs";
import { InitOptions } from "@myriaddreamin/typst.ts/dist/esm/options.init.mjs";
import { logger } from "./consola";
import { BuildFailedError } from "./errors";
import git from "isomorphic-git";
import {Buffer} from "buffer";
import { toast } from "sonner";
import { store } from "@/main";
import { messagesAtom } from "@/hooks/use-chat";

self.Buffer = Buffer;

export type CompilerInitOptions = {
  compiler: () => Promise<Partial<InitOptions>>;
  renderer: () => Promise<Partial<InitOptions>>;
};

const defaultCompilerOptions: CompilerInitOptions = {
  compiler: () =>
    Promise.resolve({
      getModule: () =>
        new URL(
          "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
          import.meta.url
        ),
    }),
  renderer: () =>
    Promise.resolve({
      getModule: () =>
        new URL(
          "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
          import.meta.url
        ),
    }),
};

export const indexedDBStore = "resume-bandhuu";

export class CallbackQueue extends Array<() => void> {
  enqueue(callback: () => void) {
    this.push(callback);
  }

  dequeue(callback?: () => void) {
    if (callback === undefined) {
      return this.shift();
    }
    const index = this.indexOf(callback);
    if (index > -1) {
      this.splice(index, 1);
    }
  }

  resolve() {
    while (this.length > 0) {
      const callback = this.shift();
      if (callback) {
        try {
          callback();
        } catch (error) {
          logger.error("Error executing callback:", error);
        }
      }
    }
  }
  
  runAll() {
    this.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        logger.error("Error executing callback:", error);
      }
    });
  }
}

export class State {
  
  /**
   * State to indicate if the document is ready for loading the compiler and renderer.
   * This is used to ensure all neccessary files are in FS before loading the compiler.
   */
  private _isReadyToLoad: boolean = false;
  public afterIsReadyToLoad = new CallbackQueue();

  get isReadyToLoad(): boolean {
    return this._isReadyToLoad;
  }

  protected set isReadyToLoad(value: boolean) {
    this._isReadyToLoad = value;
    if (value){
      this.afterIsReadyToLoad.resolve();
    }
  }

  /**
   * State to indicate if the document is ready for compilation.
   * This is used to ensure typst and fonts are loaded before compilation.
   */
  private _isReadyToCompile: boolean = false;
  public afterIsReadyToCompile = new CallbackQueue();

  get isReadyToCompile(): boolean {
    return this._isReadyToCompile;
  }

  protected set isReadyToCompile(value: boolean) {
    this._isReadyToCompile = value;
    if (value) {
      this.afterIsReadyToCompile.resolve();
    }
  }
}

export class BaseTypstDocument extends State {
  public typst: typeof $typst;
  protected observers = new CallbackQueue();
  protected mainContent: string = "";
  public fs: FS;
  public beforeLoadQueue = new CallbackQueue();

  /**
   * List of files whose presence is required for the typst compiler to work.
   */
  private importantFiles: string[] = ["main.typ", "template.yml"];

  /**
   *
   * @param mainContent contents for the file /main.typ
   * @param files additional shadow files to be mapped in the typst compiler
   */
  constructor(
    private compilerInitOptions: CompilerInitOptions = defaultCompilerOptions
  ) {
    super();
    this.fs = new FS(indexedDBStore);
    this.typst = $typst;
  }

  protected async isSetupValid(): Promise<boolean> {
    const files = await this.fs.promises.readdir("/")
    if (this.importantFiles.some(file => !files.includes(file))) {
      logger.error("Invalid setup: main.typ or template.yml not found");
      return false;
    }
    return true;
  }

  protected async mapShadowFiles() {
    const encoder = new TextEncoder();

    await this.typst.resetShadow();

    for (const file of this.importantFiles) {
      const filePath = `/${file}`;
      const fileContent = await this.getFile(filePath);
      this.typst.mapShadow(filePath, encoder.encode(fileContent));
    }
  }
  

  public async loadTypst() {
    if (!this.isReadyToLoad) {
      this.afterIsReadyToLoad.enqueue(() => this.loadTypst());
      return;
    }

    this.beforeLoadQueue.forEach((fn) => fn());

    const compilerInitOptions = await this.compilerInitOptions.compiler();
    const rendererInitOptions = await this.compilerInitOptions.renderer();

    $typst.setCompilerInitOptions(compilerInitOptions);
    $typst.setRendererInitOptions(rendererInitOptions);

    this.isReadyToCompile = true;
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

  protected async preCompileStep() {
    await this.mapShadowFiles();
  }

  async compileToPdf(): Promise<Uint8Array | undefined> {
    await this.preCompileStep();
    return await this.typst.pdf({ mainContent: this.mainContent });
  }

  async compileToSVG(): Promise<string> {
    await this.preCompileStep();
    return await this.typst.svg({ mainContent: this.mainContent });
  }

  protected async updateFileContent(path: string, newContent: string) {
    await this.fs.promises.writeFile(path, newContent, {
      encoding: "utf8",
      mode: 0o777,
    });
  }

  async updateFile(path: string, newContent: string) {
    const oldContent = await this.fs.promises.readFile(path, {
      encoding: "utf8",
    });
    await this.updateFileContent(path, newContent);
    try {
      await this.compileToSVG();
      this.observers.runAll();
    } catch (e) {
      await this.updateFileContent(path, oldContent as string);
      throw new BuildFailedError(path, e);
    }
  }

  subscribeToChanges(observer: () => void): void {
    this.observers.enqueue(observer);
  }

  unsubscribeFromChanges(observer: () => void): void {
    this.observers.dequeue(observer);
  }
  async createCheckpoint() {
    const status = await git.status({
      fs: this.fs,
      dir: "/",
      filepath: "template.yml",
    });
    if (status === "unmodified") {
      toast.error("No changes to commit", {
        id: "no-changes",
      });
      return;
    }
    await git.add({
      fs: this.fs,
      dir: "/",
      filepath: ["main.typ", "template.yml"],
    });
    const sha = await git.commit({
      fs: this.fs,
      dir: "/",
      message: "Checkpoint",
      author: {
        name: "Resume Bandhuu",
        email: "resume@bandhuu.com",
      }
    });
    toast.success("Checkpoint created", {
      description: sha
    });
    store.set(messagesAtom, prev => [...prev, sha]);
  }

  async getCheckpoints() {
    const commits = await git.log({
      fs: this.fs,
      dir: "/",
      depth: 100,
    });
    return commits;
  }

  protected async initRepository(){
    await git.init({
      fs: this.fs,
      dir: "/",
    });
  }

 

  static async resetDocument() {
    await new Promise((resolve, reject) => {
      const requst = indexedDB.deleteDatabase(indexedDBStore);
      requst.onsuccess = () => {
        resolve(true);
      };
      requst.onerror = () => {
        reject(new Error("Failed to reset the database"));
      };
    });
  }
}
