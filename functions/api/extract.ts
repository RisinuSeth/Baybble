import { extractText, getDocumentProxy } from "unpdf";
import { strFromU8, unzipSync } from "fflate";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 50_000;
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt", "csv"]);

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function cleanXmlText(xml: string): string {
  return xml
    .replace(/<w:tab\b[^>]*\/>/g, "\t")
    .replace(/<w:br\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractDocx(bytes: Uint8Array): Promise<string> {
  const files = unzipSync(bytes);
  const documentXml = files["word/document.xml"];
  if (!documentXml) throw new Error("This DOCX file does not contain a readable document body.");
  return cleanXmlText(strFromU8(documentXml));
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Please upload a valid document.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Choose a file to analyse.", 400);
  if (file.size <= 0) return jsonError("The selected file is empty.", 400);
  if (file.size > MAX_FILE_BYTES) return jsonError("Files must be 10 MB or smaller.", 413);

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return jsonError("Supported file types are PDF, DOCX, TXT and CSV.", 415);
  }

  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let text = "";
    let pageCount: number | null = null;

    if (extension === "pdf") {
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
        return jsonError("This file does not appear to be a valid PDF.", 400);
      }
      const pdf = await getDocumentProxy(bytes, { isEvalSupported: false, maxImageSize: 16_777_216 });
      if (pdf.numPages > 60) return jsonError("PDFs are limited to 60 pages in this release.", 413);
      const result = await extractText(pdf, { mergePages: false });
      const pages = Array.isArray(result.text) ? result.text : [result.text];
      pageCount = result.totalPages;
      text = pages.map((page, index) => `[Page ${index + 1}]\n${page}`).join("\n\n");
      await pdf.destroy();
    } else if (extension === "docx") {
      if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        return jsonError("This file does not appear to be a valid DOCX document.", 400);
      }
      text = await extractDocx(bytes);
    } else {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }

    text = text.replace(/\u0000/g, "").trim();
    if (!text) {
      return jsonError("No readable text was found. Scanned PDFs and image-only documents are not supported yet.", 422);
    }
    if (text.length > MAX_TEXT_CHARS) {
      text = text.slice(0, MAX_TEXT_CHARS);
    }

    return Response.json({
      name: file.name.slice(0, 255),
      mimeType: file.type || (extension === "pdf" ? "application/pdf" : extension === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : extension === "csv" ? "text/csv" : "text/plain"),
      size: file.size,
      pageCount,
      text,
      truncated: text.length >= MAX_TEXT_CHARS
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Baybble document extraction failed:", error);
    return jsonError("Baybble couldn't read this file. Try another document or a text-based PDF.", 422);
  }
};

export const onRequestOptions: PagesFunction = async () => new Response(null, {
  status: 204,
  headers: {
    "Allow": "POST, OPTIONS",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
});
