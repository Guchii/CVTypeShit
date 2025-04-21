import { tool, ToolSet } from "ai";
import { TypstDocument } from "./typst";
import { z } from "zod";

export class Tools {
  constructor(private typstDocument: TypstDocument) {}
  private getCurrentData(): string {
    return this.typstDocument.getContent();
  }
  private updateCurrentContent(newContent: string): void {
    this.typstDocument.updateDocument(newContent);
  }
  public getTools(): ToolSet {
    return {
      getCurrentData: tool({
        description: "Gets the current data of the document.",
        parameters: z.undefined(),
        execute: async () => {
          return { currentData: this.getCurrentData() };
        },
      }),
      updateCurrentData: tool({
        description: "Updates the current data of the document.",
        parameters: z.object({
          newContent: z.string(),
        }),
        execute: async ({ newContent }) => {
          this.updateCurrentContent(newContent);
          return { success: true };
        },
      }),
    };
  }
}
