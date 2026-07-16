import OpenAI from "openai";

const responseShape = {
  type: "object",
  properties: {
    recommendedChanges: { type: "array", items: { type: "string" } },
    projectSuggestions: { type: "array", items: { type: "string" } },
    rewrittenExamples: { type: "array", items: { type: "string" } },
    explanation: { type: "string" }
  },
  required: ["recommendedChanges", "projectSuggestions", "rewrittenExamples", "explanation"],
  additionalProperties: false
};

export async function getAiSuggestions({ resumeText, jobDescription, interests, ats }) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      available: false,
      recommendedChanges: [],
      projectSuggestions: [],
      rewrittenExamples: [],
      explanation: "AI suggestions are disabled. Add OPENAI_API_KEY to enable them."
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: "You are a careful career coach for computer science students. Give practical, truthful resume guidance. Do not invent experience, skills, metrics, employers, or education. Return only valid JSON matching the requested schema."
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Review this resume or resume draft against the job description. Suggest changes for user approval and propose realistic project ideas.",
          resumeText,
          jobDescription,
          interests,
          ruleBasedAts: ats
        })
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "resume_analysis_suggestions",
        strict: true,
        schema: responseShape
      }
    }
  });

  const parsed = JSON.parse(response.output_text);
  return { available: true, ...parsed };
}

export async function extractImageText(file) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("An OPENAI_API_KEY is required to read image uploads.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Image files must be 5 MB or smaller.");
  }

  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [{
      role: "user",
      content: [
        { type: "input_text", text: "Extract all readable text from this resume or job description image. Return only the extracted text." },
        { type: "input_image", image_url: dataUrl }
      ]
    }]
  });

  return response.output_text.trim();
}
