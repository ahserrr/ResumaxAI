# Resume Maximizer backend

Backend-first MVP for a no-account CS student resume builder.

## API contract

### `GET /api/health`

Returns `{ "ok": true }`.

### `POST /api/analyze`

Send `multipart/form-data` with:

- `resume`: optional PDF, JPEG, or PNG upload
- `jobDescription`: optional PDF, JPEG, or PNG upload
- `resumeData`: optional JSON string for the guided builder
- `jobDescriptionText`: optional pasted job description
- `interests`: optional JSON array, for example `["web development", "AI"]`
- `targetRole`: optional target role

The request must contain either a resume PDF or `resumeData`. The endpoint returns an ATS score out of 100, a breakdown, missing keywords, weak sections, project suggestions, and changes for user approval.

### `POST /api/resume/pdf`

Send the guided resume JSON as the request body. The endpoint returns a professional, ATS-friendly PDF download. It does not save the resume.

PDFs are read in memory and images are sent to OpenAI for text extraction; uploads are not persisted by this app. The OpenAI API key is server-only. Do not expose it through a `NEXT_PUBLIC_` environment variable.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Add `OPENAI_API_KEY` to `.env.local` for AI suggestions. Without it, the rule-based ATS analysis still works.

## Folder structure

```text
app/
  api/
    analyze/route.js       # Main resume analysis endpoint
    health/route.js        # Service health check
  layout.js
  page.js
lib/
  openai.js                # Structured AI suggestions
  pdf.js                   # In-memory PDF text extraction
  scoring.js               # Deterministic ATS scoring
```
