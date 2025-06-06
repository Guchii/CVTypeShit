/* eslint-disable @typescript-eslint/no-explicit-any */
import { store } from "@/main";
import type * as PDFJSType from "pdfjs-dist";
import {
  PDFDocumentProxy,
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";
import { activeLLMProviderAtom, appLoadingAtom, documentAtom, llmHandlerAtom } from "./atoms";
import { generateObject } from "ai";
import { ResumeDataSchema } from "./types/resume-data";
import { toast } from "sonner";
import { inputAtom } from "@/hooks/use-chat";

export class ImportResume {
  private PDFJS: typeof PDFJSType | undefined;
  private extractedText: string | undefined;

  constructor() {
    console.log("ImportResume initialized");
    this.loadPDFJS().then(() => {
      this.triggerImportResume();
    });
  }

  async handleFile(file: File): Promise<void> {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result;
      if (data instanceof ArrayBuffer) {
        const text = await this.pdfToText(data);
        console.log("Extracted text:", text);
      } else {
        console.error("File data is not an ArrayBuffer");
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
    reader.readAsArrayBuffer(file);
  }

  async triggerImportResume(): Promise<void> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const selectedFile = target.files[0];
        if (selectedFile) {
          await this.handleFile(selectedFile);
        }
      }
    };
    input.click();
  }

  async loadPDFJS() {
    const pdfjsModule = await import("pdfjs-dist");
    this.PDFJS = pdfjsModule;
    (window as any).PDFJS = pdfjsModule;
    if (pdfjsModule.GlobalWorkerOptions) {
      pdfjsModule.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs";
    }
  }

  public async pdfToText(data: ArrayBuffer): Promise<string> {
    if (!this.PDFJS) {
      console.error("PDFJS not loaded");
      return "";
    }

    try {
      const pdf = (await this.PDFJS.getDocument(data)
        .promise) as PDFDocumentProxy;
      const total = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: TextItem | TextMarkedContent) => {
            if ("str" in item) {
              return item.str;
            }
            return "";
          })
          .join(" ");
        fullText += pageText + "\\n";
      }
      this.extractedText = fullText;
      this.getResumeDataFromText();
      return fullText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      return "";
    }
  }

  public async getResumeDataFromText() {
    if (!this.extractedText) {
      console.error("No extracted text available");
      return;
    }
    const id = toast.loading("Extracting resume data...");
    const llmHandler = store.get(llmHandlerAtom);
    const document = await store.get(documentAtom);
    try {
      store.set(appLoadingAtom, true);
      const resumeData = await generateObject({
        mode: "json",
        model: llmHandler.model,
        maxRetries: 3,
        schema: ResumeDataSchema,
        prompt:
          "Extract the resume data from the text, for the URL Fields populate it with any random valid links, dates are required in YYYY-MM-DD format, add random valid dates wherever required" +
          "The text is: " +
          this.extractedText,
      });
      document.data = resumeData.object;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update resume data.", {
        description: "Your input field will be populated with the extracted text.",
      });
      const provider = store.get(activeLLMProviderAtom);
      if (provider === "pollinations") {
        toast.error("Pollinations LLM provider is not supported for this operation.");
      }
      store.set(inputAtom, this.promptFromResumeString(this.extractedText));
    }
    store.set(appLoadingAtom, false);
    toast.dismiss(id);
  }

  private promptFromResumeString(resumeString?: string): string {
    if (!resumeString) {
      return "";
    }
    return `
      This is my resume data:
      ${resumeString}
    `.trim();
  }
}
