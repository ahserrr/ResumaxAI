import pdf from "pdf-parse";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export async function extractPdfText(file) {
  if (!file || typeof file.arrayBuffer !== "function") return "";

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error("PDF files must be 5 MB or smaller.");
  }

  const result = await pdf(buffer);
  return result.text.replace(/\s+/g, " ").trim();
}
