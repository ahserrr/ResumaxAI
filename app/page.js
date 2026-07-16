"use client";

import { useEffect, useState } from "react";

const initialResume = {
  contact: { name: "", email: "", phone: "", linkedin: "", github: "" },
  education: "",
  skills: "",
  projects: "",
  experience: "",
  certifications: "",
  activities: ""
};

export default function HomePage() {
  const [resume, setResume] = useState(initialResume);
  const [jobText, setJobText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobFile, setJobFile] = useState(null);
  const [targetRole, setTargetRole] = useState("Entry-level Software Engineer");
  const [interests, setInterests] = useState("web development, artificial intelligence");
  const [template, setTemplate] = useState("modern");
  const [result, setResult] = useState(null);
  const [approvedChanges, setApprovedChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("resume-maximizer-draft");
    if (saved) setResume(JSON.parse(saved));
  }, []);

  function update(field, value) {
    const updated = { ...resume, [field]: value };
    setResume(updated);
    localStorage.setItem("resume-maximizer-draft", JSON.stringify(updated));
  }

  function updateContact(field, value) {
    const updated = { ...resume, contact: { ...resume.contact, [field]: value } };
    setResume(updated);
    localStorage.setItem("resume-maximizer-draft", JSON.stringify(updated));
  }

  function getEntries(value) {
    return String(value || "").split("\n\n").filter(Boolean).length ? String(value || "").split("\n\n") : [""];
  }

  function updateEntry(field, index, value) {
    const entries = getEntries(resume[field]);
    entries[index] = value;
    update(field, entries.join("\n\n"));
  }

  function addEntry(field) {
    update(field, `${resume[field] || ""}${resume[field] ? "\n\n" : ""}`);
  }

  function removeEntry(field, index) {
    const entries = getEntries(resume[field]);
    entries.splice(index, 1);
    update(field, entries.join("\n\n"));
  }

  function approveChange(change) {
    setApprovedChanges((current) => current.includes(change) ? current : [...current, change]);
  }

  function goTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearDraft() {
    localStorage.removeItem("resume-maximizer-draft");
    setResume(initialResume);
    setResult(null);
  }

  async function analyze(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("resumeData", JSON.stringify(resume));
      form.append("jobDescriptionText", jobText);
      form.append("interests", JSON.stringify(interests.split(",").map((item) => item.trim()).filter(Boolean)));
      form.append("targetRole", targetRole);
      form.append("template", template);
      if (resumeFile) form.append("resume", resumeFile);
      if (jobFile) form.append("jobDescription", jobFile);

      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    const response = await fetch("/api/resume/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...resume, template })
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  const inputStyle = { width: "100%", padding: 12, border: "1px solid #d7dbe7", borderRadius: 10, marginTop: 6, fontSize: 14 };
  const cardStyle = { background: "white", border: "1px solid #e7e9f0", borderRadius: 16, padding: 22, marginBottom: 18 };

  return (
    <main className="dashboard-shell" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8f9ff 0%, #f4f5fb 100%)", padding: "28px 24px", fontFamily: "Arial, sans-serif", color: "#172033", display: "flex", gap: 24, alignItems: "flex-start" }}>
      <aside className="dashboard-sidebar" style={{ width: 230, minHeight: "calc(100vh - 56px)", background: "#17132d", color: "white", borderRadius: 22, padding: 22, position: "sticky", top: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Resumax<span style={{ color: "#a99cff" }}>AI</span></div>
        <p style={{ color: "#aaa2c8", fontSize: 12, lineHeight: 1.5 }}>Your career copilot for stronger applications.</p>
        <nav style={{ marginTop: 34, display: "grid", gap: 8 }}>
          <button type="button" onClick={() => goTo("dashboard-preview")} style={{ textAlign: "left", background: "#6556d8", color: "white", border: 0, borderRadius: 10, padding: "12px 13px", fontWeight: 700, cursor: "pointer" }}>⌂ Dashboard</button>
          <button type="button" onClick={() => goTo("resume-builder")} style={{ textAlign: "left", color: "#c4bddb", background: "transparent", border: 0, padding: "12px 13px", cursor: "pointer" }}>✦ Resume builder</button>
          <button type="button" onClick={() => goTo("analysis-results")} style={{ textAlign: "left", color: "#c4bddb", background: "transparent", border: 0, padding: "12px 13px", cursor: "pointer" }}>◈ ATS analysis</button>
          <button type="button" onClick={() => goTo("settings")} style={{ textAlign: "left", color: "#c4bddb", background: "transparent", border: 0, padding: "12px 13px", cursor: "pointer" }}>⚙ Settings</button>
        </nav>
        <div style={{ marginTop: 80, borderTop: "1px solid #383052", paddingTop: 18, color: "#aaa2c8", fontSize: 12 }}>Demo mode<br /><span style={{ color: "#e5e1f5" }}>Saved in your browser</span></div>
      </aside>
      <div style={{ maxWidth: 900, margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start" }}>
          <div><p style={{ color: "#6556d8", fontWeight: 700, letterSpacing: 1 }}>GOOD TO SEE YOU</p>
          <h1 style={{ fontSize: 38, margin: "8px 0" }}>Build a resume recruiters notice.</h1></div>
          <div style={{ background: "white", border: "1px solid #e7e9f0", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#667085" }}>● Demo workspace</div>
        </div>
        <p style={{ color: "#667085", marginBottom: 28 }}>Create your resume, compare it with a job, and improve your ATS score.</p>

        <div style={{ ...cardStyle, display: "flex", gap: 16, alignItems: "center", background: "linear-gradient(110deg, #eeeaff, #ffffff)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "#6556d8", color: "white", display: "grid", placeItems: "center", fontWeight: 800 }}>1</div>
          <div><strong>Complete your resume profile</strong><div style={{ color: "#667085", fontSize: 13, marginTop: 4 }}>Add your experience, projects, and target job to unlock your ATS insights.</div></div>
        </div>

        <section id="dashboard-preview" style={{ ...cardStyle, background: "#fff", border: "1px solid #ded9ff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div><p style={{ color: "#6556d8", fontWeight: 700, fontSize: 12, margin: 0 }}>LIVE PREVIEW</p><h2 style={{ margin: "5px 0 0" }}>Your resume canvas</h2></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 24, fontWeight: 800, color: result ? "#6556d8" : "#98a2b3" }}>{result ? `${result.score}/100` : "—"}</div><small style={{ color: "#667085" }}>ATS score</small></div>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 22, background: "#fff", minHeight: 230 }}>
            <h2 style={{ margin: 0, color: "#172033" }}>{resume.contact.name || "Your Name"}</h2>
            <p style={{ color: "#667085", fontSize: 12 }}>{[resume.contact.email, resume.contact.phone, resume.contact.linkedin, resume.contact.github].filter(Boolean).join("  •  ") || "email • phone • LinkedIn • GitHub"}</p>
            {resume.education && <><h4>EDUCATION</h4><p style={{ whiteSpace: "pre-wrap" }}>{resume.education}</p></>}
            {resume.skills && <><h4>SKILLS</h4><p>{resume.skills}</p></>}
            {resume.projects && <><h4>PROJECTS</h4><p style={{ whiteSpace: "pre-wrap" }}>{resume.projects}</p></>}
            {resume.experience && <><h4>EXPERIENCE</h4><p style={{ whiteSpace: "pre-wrap" }}>{resume.experience}</p></>}
            {!resume.education && !resume.skills && !resume.projects && !resume.experience && <p style={{ color: "#98a2b3", textAlign: "center", padding: 35 }}>Start filling in your resume to see a live preview.</p>}
          </div>
        </section>

        <form id="resume-builder" onSubmit={analyze}>
          <section style={cardStyle}>
            <h2>Personal information</h2>
            <input style={inputStyle} placeholder="Full name" value={resume.contact.name} onChange={(e) => updateContact("name", e.target.value)} />
            <input style={inputStyle} placeholder="Email" value={resume.contact.email} onChange={(e) => updateContact("email", e.target.value)} />
            <input style={inputStyle} placeholder="Phone number" value={resume.contact.phone} onChange={(e) => updateContact("phone", e.target.value)} />
            <input style={inputStyle} placeholder="LinkedIn URL" value={resume.contact.linkedin} onChange={(e) => updateContact("linkedin", e.target.value)} />
            <input style={inputStyle} placeholder="GitHub URL" value={resume.contact.github} onChange={(e) => updateContact("github", e.target.value)} />
          </section>

          <section style={cardStyle}>
            <h2>Resume information</h2>
            <textarea style={inputStyle} rows={3} placeholder="Education" value={resume.education} onChange={(e) => update("education", e.target.value)} />
            <textarea style={inputStyle} rows={3} placeholder="Skills" value={resume.skills} onChange={(e) => update("skills", e.target.value)} />
            <h3>Projects</h3>
            {getEntries(resume.projects).map((entry, index) => <div key={`project-${index}`}><textarea style={inputStyle} rows={5} placeholder="Project name, technologies, actions, and results" value={entry} onChange={(e) => updateEntry("projects", index, e.target.value)} />{getEntries(resume.projects).length > 1 && <button type="button" onClick={() => removeEntry("projects", index)} style={{ marginTop: 6, color: "#c0392b", border: 0, background: "none", cursor: "pointer" }}>Remove project</button>}</div>)}
            <button type="button" onClick={() => addEntry("projects")} style={{ marginTop: 8, border: "1px solid #6556d8", color: "#6556d8", background: "white", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>+ Add another project</button>
            <h3>Experience</h3>
            {getEntries(resume.experience).map((entry, index) => <div key={`experience-${index}`}><textarea style={inputStyle} rows={4} placeholder="Role, company, dates, responsibilities, and measurable results" value={entry} onChange={(e) => updateEntry("experience", index, e.target.value)} />{getEntries(resume.experience).length > 1 && <button type="button" onClick={() => removeEntry("experience", index)} style={{ marginTop: 6, color: "#c0392b", border: 0, background: "none", cursor: "pointer" }}>Remove experience</button>}</div>)}
            <button type="button" onClick={() => addEntry("experience")} style={{ marginTop: 8, border: "1px solid #6556d8", color: "#6556d8", background: "white", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>+ Add another experience</button>
            <textarea style={inputStyle} rows={3} placeholder="Certifications" value={resume.certifications} onChange={(e) => update("certifications", e.target.value)} />
            <textarea style={inputStyle} rows={3} placeholder="Extracurricular activities, leadership, or volunteering" value={resume.activities} onChange={(e) => update("activities", e.target.value)} />
          </section>

          <section style={cardStyle}>
            <h2>Target job</h2>
            <label style={{ display: "block", marginTop: 10, fontSize: 14, fontWeight: 700 }}>Resume template
              <select style={inputStyle} value={template} onChange={(e) => setTemplate(e.target.value)}>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>
            <input style={inputStyle} placeholder="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            <input style={inputStyle} placeholder="Interests, separated by commas" value={interests} onChange={(e) => setInterests(e.target.value)} />
            <textarea style={inputStyle} rows={8} placeholder="Paste the job description here" value={jobText} onChange={(e) => setJobText(e.target.value)} />
            <label style={{ display: "block", marginTop: 14, fontSize: 14, fontWeight: 700 }}>
              Upload an existing resume PDF (optional)
              <input style={{ display: "block", marginTop: 8 }} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
            </label>
            <label style={{ display: "block", marginTop: 14, fontSize: 14, fontWeight: 700 }}>
              Upload a job description PDF (optional)
              <input style={{ display: "block", marginTop: 8 }} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setJobFile(e.target.files?.[0] || null)} />
            </label>
          </section>

          <button type="submit" disabled={loading} style={{ background: "#6556d8", color: "white", border: 0, borderRadius: 10, padding: "14px 22px", fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Analyzing..." : "Analyze my resume"}
          </button>
        </form>

        {error && <p style={{ color: "#c0392b", marginTop: 18 }}>{error}</p>}

        {result && (
          <section id="analysis-results" style={{ ...cardStyle, marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 92, height: 92, borderRadius: "50%", background: "#eeeaff", display: "grid", placeItems: "center", color: "#6556d8", fontSize: 24, fontWeight: 800 }}>{result.score}</div>
              <div><h2 style={{ margin: 0 }}>ATS score / 100</h2><p style={{ color: "#667085" }}>Higher scores usually mean stronger alignment with the job description.</p></div>
            </div>
            <p>{result.aiAvailable ? "AI suggestions are ready for your approval." : "Rule-based analysis is ready. Add your API key for AI suggestions."}</p>
            <h3>Score breakdown</h3>
            <ul>
              {Object.entries(result.breakdown || {}).map(([category, score]) => <li key={category}>{category}: {score} points</li>)}
            </ul>

            <h3>Missing keywords</h3>
            <p>{result.missingKeywords?.length ? result.missingKeywords.join(", ") : "No major missing keywords detected."}</p>

            <h3>Weak sections and formatting</h3>
            <ul>{(result.weakSections || []).map((item) => <li key={item}>{item}</li>)}</ul>

            <h3>Recommended changes</h3>
            <ul>{(result.recommendedChanges || []).map((item) => <li key={item} style={{ marginBottom: 10 }}>{item} <button onClick={() => approveChange(item)} style={{ marginLeft: 8, border: "1px solid #6556d8", background: approvedChanges.includes(item) ? "#e7f8ed" : "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>{approvedChanges.includes(item) ? "Approved" : "Approve"}</button></li>)}</ul>

            <h3>Project suggestions</h3>
            <ul>{(result.projectSuggestions || []).map((item) => <li key={item}>{item}</li>)}</ul>

            {result.rewrittenExamples?.length > 0 && <><h3>Suggested rewrites</h3><ul>{result.rewrittenExamples.map((item) => <li key={item} style={{ marginBottom: 8 }}>{item}</li>)}</ul></>}
            {approvedChanges.length > 0 && <p style={{ color: "#18794e", fontWeight: 700 }}>{approvedChanges.length} suggestion(s) approved for your next resume edit.</p>}
            <button onClick={downloadPdf} style={{ marginTop: 12, background: "#172033", color: "white", border: 0, borderRadius: 10, padding: "12px 18px", cursor: "pointer" }}>Download PDF</button>
          </section>
        )}

        <section id="settings" style={{ ...cardStyle, marginTop: 24 }}>
          <h2>Settings</h2>
          <p style={{ color: "#667085" }}>Your demo resume is saved only in this browser.</p>
          <button type="button" onClick={clearDraft} style={{ border: "1px solid #d92d20", color: "#d92d20", background: "white", borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}>Clear saved draft</button>
        </section>
      </div>
    </main>
  );
}
