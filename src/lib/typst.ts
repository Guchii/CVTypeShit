import { tool, ToolSet } from "ai";
import { parse, stringify } from "yaml";
import { z, ZodSchema } from "zod";
import git from "isomorphic-git";

import { ResumeData, ResumeDataSchema } from "./types/resume-data";
import { BaseTypstDocument, CompilerInitOptions } from "./base-typst";
import { loadJQ } from "./jq";
import { logger } from "./consola";
import _ from "lodash";
import { BuildFailedError } from "./errors";
import { toast } from "sonner";
import { store } from "@/main";
import { messagesAtom } from "@/hooks/use-chat";

export class TypstDocument extends BaseTypstDocument {
  private _data: ResumeData;
  constructor(
    private templateName = "template-1",
    compilerInitOptions?: CompilerInitOptions
  ) {
    super(compilerInitOptions);
    this._data = {personal: {name: "Chutkule Srivastava"}};
    console.log(this);
  }


  /**
   * Initializes the document, this is called when the document is created.
   * It is used to set up the typst compiler and renderer.
   */
  public async init() {
    logger.start(this.init.name, this.templateName);

    await this.initRepository();

    const isValid = await this.isSetupValid();
    if (isValid) {
      const data = await this.getFile('/template.yml');
      const mainContent = await this.getFile('/main.typ');
      this._data = parse(data)
      this.mainContent = mainContent;
    } else {
      await this.fetchTemplateAndData();
    }

    this.isReadyToLoad = true;
  }

   /**
    * Doesn't actually destroy the document, but resets the state of the document.
    * doesn't remove the files from the file system.
    */
  public async destroy() {
    this.isReadyToCompile = false;
    this.isReadyToLoad = false;
    this.mainContent = "";
    this._data = {personal: {name: "Chutkule Srivastava"}};
  }


  async fetchTemplateAndData() {
    logger.start(this.fetchTemplateAndData.name, this.templateName);

    const templateResponse = await fetch(`/templates/${this.templateName}/main.typ`);
    let templateText = await templateResponse.text();

    if (templateText) {
      const regex = /(#let cvdata = yaml\(")\.\//g;
      templateText = templateText.replace(regex, "$1/");
    }

    const dataResponse = await fetch(`/templates/${this.templateName}/template.yml`);
    const dataText = await dataResponse.text();

    // Writing to File System
    await this.updateFileContent("/main.typ", templateText);
    await this.updateFileContent("/template.yml", dataText);

    console.log(await this.getFile("/main.typ"));
    console.log(await this.getFile("/template.yml"));

    // Updating in memory document data
    this.mainContent = templateText;
    this._data = parse(dataText);
  }

  get data() {
    return this._data;
  }

  set data(data: ResumeData) {
    const oldData = _.cloneDeep(this._data);
    this._data = data;
    try {
      this.updateFile("/template.yml", stringify(this._data));
    } catch (e) {
      if (BuildFailedError.isBuildFailedError(e)) {
        this._data = oldData;
      }
      throw e;
    }
  }

  async setData(data: ResumeData) {
    const oldData = _.cloneDeep(this._data);
    this._data = data;
    try {
      await this.updateFile("/template.yml", stringify(this._data));
    } catch (e) {
      if (BuildFailedError.isBuildFailedError(e)) {
        this._data = oldData;
      }
      throw e;
    }
  }

  async replaceData(yaml: string) {
    this._data = parse(yaml);
    await this.updateFile("/template.yml", yaml);
  }

  getTools() {
    const tools: ToolSet = {
      mutate: tool({
        parameters: z.object({
          jqQuery: z
            .string()
            .describe(
              "jq update query to be run, result should return the whole updated json"
            ),
        }),
        description:
          "Update the Resume JSON with the help of a jq query string,\
          query will be run against the json and your query should return the whole updated json",
        execute: async ({ jqQuery }) => {
          const jq = await loadJQ();
          logger.start("Started Updating JSON with query", jqQuery);
          try {
            const jsonString = await jq.invoke(
              JSON.stringify(this._data, null, 2),
              jqQuery
            );

            await this.setData(JSON.parse(jsonString));
            toast.success("Resume Updated");
            return "Success";
          } catch (e) {
            this.handleError(e);
            return "Failed";
          }
        },
      }),
      query: tool({
        parameters: z.object({
          jqQuery: z.string().describe("jq query to be run"),
        }),
        description:
          "Query the Resume JSON with the help of a jq query string,\
          query will be run against the json and result will be returned to you",
        execute: async ({ jqQuery }) => {
          const jq = await loadJQ();
          try {
            logger.start("Started Querying JSON with query", jqQuery);
            const result = await jq.invoke(
              JSON.stringify(this._data, null, 2),
              jqQuery
            );
            logger.debug("result:", result);
            return result;
          } catch (e) {
            this.handleError(e);
            return "Failed";
          }
        },
      }),
    };
    return tools;
  }
 async resetToCheckpoint(sha: string) {
    await git.checkout({
      fs: this.fs,
      dir: "/",
      ref: sha,
      force: true
    });
    store.set(messagesAtom, prev => {
      const index = prev.indexOf(sha);
      if (index > -1) {
        return prev.slice(0, index);
      }
      return prev;
    });
    // Sync in memory data object as well for form usage, this won't be done from here
    // But for POC purposes, we will adjust with just re-rendering the resume preview
    await this.replaceData(await this.getFile('/template.yml'))
    this.observers.runAll();
  }

  private handleError(e: unknown, displayToast = true) {
    if (BuildFailedError.isBuildFailedError(e)) {
      logger.error(e);
      if (displayToast) toast.error(e.message);
      return;
    }
    logger.error(new Error("JQ Errored Out"), e);
  }

  getDataSchema(): ZodSchema {
    return ResumeDataSchema.deepPartial();
  }
}
