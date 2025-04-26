import { tool, ToolSet } from "ai";
import _ from "lodash";
import { parse, stringify } from "yaml";
import z, { ZodSchema } from "zod";

import { ResumeData, ResumeDataSchema } from "./types/resume-data";
import { TypstDocument } from "./typst";
import { sampleResumeContent } from "./content";

export class Template1 extends TypstDocument {
  private _data: ResumeData;
  constructor(
    template = sampleResumeContent,
    yaml = `personal:
  name: Add Your Name`
  ) {
    super(template, [
      {
        content: yaml,
        path: "/template.yml",
      },
    ]);
    this._data = parse(yaml);
  }

  get data() {
    return this._data;
  }

  set data(data: ResumeData) {
    this._data = data;
    this.updateFile("/template.yml", stringify(this._data));
  }

  updatePersonalData(payload: Partial<ResumeData["personal"]>) {
    this._data.personal = _.merge(this._data.personal, payload);
    this.data = this._data;
  }

  getPersonalData() {
    return this._data.personal;
  }

  getTools() {
    const tools: ToolSet = {
      getPersonalData: tool({
        description: "Get Existing personal data in the resume",
        parameters: z.object({}),
        execute: async () => {
          return {
            data: this.getPersonalData(),
          };
        },
      }),
      updatePersonalData: tool({
        description: "Update personal data in the resume",
        parameters: z.object({
          name: z.string().optional().describe("Full name"),
          titles: z.array(z.string()).optional().describe(`
                    Title(s) for the resume. 
                    Example: 
                    - Software Engineer
                    - Data Analyst
                    - Entrepreneur`),
          email: z.string().optional().describe("Email address"),
          phone: z.string().optional().describe("Phone number"),
          location: z
            .object({
              city: z.string().describe("City"),
              region: z.string().describe("Region"),
              country: z.string().describe("Country"),
            })
            .optional()
            .describe("Base location"),
          url: z.string().optional().describe("Personal website"),
        }),
        execute: async ({ ...payload }) => {
          this.updatePersonalData(payload);
          return {
            data: this.getPersonalData(),
          };
        },
      }),
    };
    return tools;
  }

  getDataSchema(): ZodSchema {
    return ResumeDataSchema.deepPartial();
  }
}
