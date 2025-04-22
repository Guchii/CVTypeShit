import { tool, ToolSet } from "ai";
import { TypstDocument } from "./typst";
import { z } from "zod";

export class Tools {
  constructor(private typstDocument: TypstDocument) {}
  private getCurrentData(): string {
    return this.typstDocument.getFile("/template.yml");
  }
  private updateCurrentData(newContent: string): void {
    this.typstDocument.updateFile("/template.yml", newContent);
  }
  public getTools(): ToolSet {
    return {
      getCurrentData: tool({
        description:
          "Fetches the current resume data in YAML format, including all sections (personal info, work experience, education, etc.). Use this to understand the existing structure before making updates.",
        parameters: z.object({}),
        execute: async () => {
          return { currentData: this.getCurrentData() };
        },
      }),
      updateCurrentData: tool({
        description:
          "Overwrites the entire resume YAML with new content and triggers a live UI update. Provide the full YAML (not a diff) to ensure consistency. Use this after modifying any section.",
        parameters: z.object({
          newContent: z
            .string()
            .describe("The new yaml content to update the resume with"),
        }),
        execute: async ({ newContent }) => {
          this.updateCurrentData(newContent);
          return { success: true };
        },
      }),
    };
  }
}
