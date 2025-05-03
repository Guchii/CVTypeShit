import { ToolSet } from "ai";
import { parse, stringify } from "yaml";
import { ZodSchema } from "zod";

import { ResumeData, ResumeDataSchema } from "./types/resume-data";
import { BaseTypstDocument } from "./base-typst";

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
    const tools: ToolSet = {};
    return tools;
  }

  getDataSchema(): ZodSchema {
    return ResumeDataSchema.deepPartial();
  }
}
