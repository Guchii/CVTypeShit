import { tool, ToolSet } from "ai";
import { parse, stringify } from "yaml";
import { z, ZodSchema } from "zod";

import { ResumeData, ResumeDataSchema } from "./types/resume-data";
import {
  BaseTypstDocument,
  CompilerInitOptions,
  indexedDBStore,
} from "./base-typst";
import { loadJQ } from "./jq";
import { logger } from "./consola";

export class TypstDocument extends BaseTypstDocument {
  private _data: ResumeData;
  constructor(
    template = "",
    yaml = "",
    private templateName = "template-1",
    compilerInitOptions?: CompilerInitOptions
  ) {
    super(
      template,
      [
        {
          content: yaml,
          path: "/template.yml",
        },
      ],
      compilerInitOptions
    );
    this._data = parse(yaml);
  }

  async fetchTemplateAndData() {
    try {
      const template = await this.fs.promises.readFile("/main.typ", {
        encoding: "utf8",
      });
      const data = await this.fs.promises.readFile("/template.yml", {
        encoding: "utf8",
      });
      if (data) {
        this.replaceData(data);
      }
      if (!data || !template) {
        throw new Error("No content found in /main.typ");
      }
    } catch {
      const templateResponse = await fetch(
        `/templates/${this.templateName}/main.typ`
      );

      let templateText = await templateResponse.text();
      if (templateText) {
        const regex = /(#let cvdata = yaml\(")\.\//g;
        templateText = templateText.replace(regex, "$1/");
      }

      const dataResponse = await fetch(
        `/templates/${this.templateName}/template.yml`
      );
      const dataText = await dataResponse.text();

      this.updateDocument(templateText);
      this.replaceData(dataText);
    }
  }

  async cleanup() {
    this.updateDocument("");
    this.updateFile("/template.yml", "");
  }

  get data() {
    return this._data;
  }

  set data(data: ResumeData) {
    this._data = data;
    this.updateFile("/template.yml", stringify(this._data));
  }

  replaceData(yaml: string) {
    this._data = parse(yaml);
    this.updateFile("/template.yml", yaml);
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
            const newJSON = await jq.invoke(
              JSON.stringify(this._data, null, 2),
              jqQuery
            );
            this.data = JSON.parse(newJSON);
            return "Success";
          } catch (e) {
            logger.error("JQ errored out", e);
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
            logger.error("JQ Errored Out", e);
            return "Failed";
          }
        },
      }),
    };
    return tools;
  }

  getDataSchema(): ZodSchema {
    return ResumeDataSchema.deepPartial();
  }

  async resetDocument() {
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
