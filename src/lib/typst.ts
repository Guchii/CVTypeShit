import { tool, ToolSet } from "ai";
import { parse, stringify } from "yaml";
import { z, ZodSchema } from "zod";

import { ResumeData, ResumeDataSchema } from "./types/resume-data";
import { BaseTypstDocument } from "./base-typst";
import { toast } from "sonner";

export class TypstDocument extends BaseTypstDocument {
  private _data: ResumeData;
  constructor(template = "", yaml = "", private templateName = "template-1") {
    super(template, [
      {
        content: yaml,
        path: "/template.yml",
      },
    ]);
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
      // "updatePersonalInfo": tool({
      //   description: "Update the personal information",
      //   parameters: PersonalInfoSchema.describe("Replaces the personal information in the resume"),
      //   execute: async (args) => {
      //     this._data.personal = args; 
      //     this.updateFile("/template.yml", stringify(this._data));
      //   },
      // }),
      "getPersonalInfo": tool({
        description: "Gets the existing personal information",
        parameters: z.object({}),
        execute: async () => {
          return this._data.personal;
        },
      }),
      "successToast": tool({
        description: "Shows a success toast",
        parameters: z.object({
          message: z.string(),
        }),
        execute: async (args) => {
          toast.success(args.message);
        },
      })
  };
    return tools;
  }

  getDataSchema(): ZodSchema {
    return ResumeDataSchema.deepPartial();
  }

  async resetDocument() {
    await new Promise((resolve, reject) => {
      const requst = indexedDB.deleteDatabase("RESUME_MASTI");
      requst.onsuccess = () => {
        resolve(true);
      };
      requst.onerror = () => {
        reject(new Error("Failed to reset the database"));
      }
    });
  }
}
