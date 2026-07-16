const SECTION_ALIASES = {
  contact: ["email", "phone", "linkedin", "github"],
  education: ["education", "university", "college", "bachelor", "degree"],
  skills: ["skills", "technologies", "technical skills"],
  projects: ["projects", "portfolio"],
  experience: ["experience", "employment", "internship", "work history"],
  certifications: ["certifications", "certificate"],
  activities: ["activities", "leadership", "volunteer", "extracurricular"]
};

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "because", "being", "between", "could",
  "their", "there", "these", "those", "through", "using", "which", "would",
  "your", "with", "from", "this", "that", "have", "will", "into", "for"
]);

function words(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .map((word) => word.replace(/^[.-]+|[.-]+$/g, ""))
      .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
  );
}

function findSections(resumeText) {
  const lower = resumeText.toLowerCase();
  return Object.fromEntries(
    Object.entries(SECTION_ALIASES).map(([section, aliases]) => [
      section,
      aliases.some((alias) => lower.includes(alias))
    ])
  );
}

function keywordMatches(resumeText, jobText) {
  if (!jobText) return { matched: [], missing: [] };
  const resumeWords = words(resumeText);
  const jobWords = [...words(jobText)].filter((word) => word.length >= 4);
  const matched = jobWords.filter((word) => resumeWords.has(word));
  const missing = jobWords.filter((word) => !resumeWords.has(word));
  return { matched, missing: missing.slice(0, 20) };
}

export function calculateAtsScore({ resumeText, jobDescription = "" }) {
  const sections = findSections(resumeText);
  const sectionCount = Object.values(sections).filter(Boolean).length;
  const sectionScore = Math.round((sectionCount / Object.keys(sections).length) * 25);
  const keywords = keywordMatches(resumeText, jobDescription);
  const keywordScore = jobDescription
    ? Math.round((keywords.matched.length / Math.max(keywords.matched.length + keywords.missing.length, 1)) * 35)
    : 18;
  const measurableScore = /\b\d+(?:%|\+|x)?\b/.test(resumeText) ? 15 : 5;
  const formattingScore = !/[|]{2,}|[^\x00-\x7F]/.test(resumeText) ? 15 : 8;
  const total = Math.max(0, Math.min(100, sectionScore + keywordScore + measurableScore + formattingScore));

  return {
    score: total,
    breakdown: {
      keywords: keywordScore,
      sections: sectionScore,
      achievements: measurableScore,
      formatting: formattingScore
    },
    missingKeywords: keywords.missing,
    matchedKeywords: keywords.matched,
    sections,
    weakSections: [
      ...Object.entries(sections)
        .filter(([, present]) => !present)
        .map(([section]) => `Add a ${section} section.`),
      ...(measurableScore < 15 ? ["Add measurable outcomes to project or experience bullets."] : []),
      ...(formattingScore < 15 ? ["Use simple ATS-friendly formatting and avoid unusual symbols."] : [])
    ]
  };
}
