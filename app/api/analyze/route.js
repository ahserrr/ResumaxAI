import { NextResponse } from "next/server";
import { extractPdfText } from "../../../lib/pdf";
import { calculateAtsScore } from "../../../lib/scoring";
import { extractImageText, getAiSuggestions } from "../../../lib/openai";

export const runtime = "nodejs";

function parseJsonField(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function extractUploadText(file) {
  if (!file?.name) return "";
  if (file.type === "application/pdf") return extractPdfText(file);
  if (["image/jpeg", "image/png"].includes(file.type)) return extractImageText(file);
  throw new Error("Only PDF, JPEG, and PNG files are supported.");
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const resumeFile = form.get("resume");
    const jobFile = form.get("jobDescription");
    const resumeData = parseJsonField(form.get("resumeData"), {});
    const interests = parseJsonField(form.get("interests"), []);
    const targetRole = form.get("targetRole") || "computer science role";
    const pastedJobDescription = form.get("jobDescriptionText") || "";

    const resumePdfText = await extractUploadText(resumeFile);
    const jobPdfText = await extractUploadText(jobFile);
    const draftText = Object.entries(resumeData)
      .flatMap(([key, value]) => [key, Array.isArray(value) ? value.join(" ") : value])
      .filter(Boolean)
      .join(" ");
    const resumeText = resumePdfText || draftText;
    const jobDescription = jobPdfText || pastedJobDescription;

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Provide resumeData or upload a resume PDF." }, { status: 400 });
    }

    const ats = calculateAtsScore({ resumeText, jobDescription });
    const ai = await getAiSuggestions({ resumeText, jobDescription, interests, targetRole, ats });

    return NextResponse.json({
      score: ats.score,
      breakdown: ats.breakdown,
      missingKeywords: ats.missingKeywords,
      matchedKeywords: ats.matchedKeywords,
      weakSections: ats.weakSections,
      sections: ats.sections,
      recommendedChanges: ai.recommendedChanges,
      projectSuggestions: ai.projectSuggestions,
      rewrittenExamples: ai.rewrittenExamples,
      explanation: ai.explanation,
      aiAvailable: ai.available,
      privacy: { filesPersisted: false }
    });
  } catch (error) {
    console.error("Resume analysis failed:", error.message);
    return NextResponse.json({ error: "Unable to analyze the submitted resume." }, { status: 500 });
  }
}
