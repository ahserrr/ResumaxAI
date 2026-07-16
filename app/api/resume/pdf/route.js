import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function createResumePdf(resume) {
  return new Promise((resolve) => {
    const document = new PDFDocument({ size: "LETTER", margin: 54 });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));

    const contact = resume.contact || {};
    const template = resume.template || "modern";
    const accent = template === "classic" ? "#1f2937" : template === "minimal" ? "#555555" : "#4f46e5";
    const name = contact.name || "Your Name";
    const contactLine = [contact.email, contact.phone, contact.linkedin, contact.github]
      .filter(Boolean)
      .join("  |  ");

    document.font("Helvetica-Bold").fontSize(template === "minimal" ? 18 : 20).fillColor(accent).text(name, { align: template === "minimal" ? "left" : "center" });
    document.font("Helvetica").fontSize(9).fillColor("#444").text(contactLine, { align: template === "minimal" ? "left" : "center" });
    document.moveDown(1);

    const section = (title, body) => {
      document.moveDown(0.5);
      document.font("Helvetica-Bold").fontSize(11).fillColor(accent).text(title.toUpperCase());
      if (template !== "minimal") document.moveTo(54, document.y).lineTo(558, document.y).strokeColor("#aaaaaa").stroke();
      document.moveDown(0.25);
      document.font("Helvetica").fontSize(9).fillColor("#222").text(body);
    };

    if (resume.summary) section("Summary", resume.summary);
    if (resume.education) section("Education", resume.education);
    if (resume.skills) section("Skills", asArray(resume.skills).join("  •  "));
    if (resume.projects) section("Projects", asArray(resume.projects).join("\n"));
    if (resume.experience) section("Experience", asArray(resume.experience).join("\n"));
    if (resume.certifications) section("Certifications", asArray(resume.certifications).join("\n"));
    if (resume.activities) section("Activities", asArray(resume.activities).join("\n"));

    document.end();
  });
}

export async function POST(request) {
  try {
    const resume = await request.json();
    const pdf = await createResumePdf(resume);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
        "Content-Length": String(pdf.length)
      }
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ error: "Unable to generate the resume PDF." }, { status: 400 });
  }
}
