const { useState, useRef, useCallback } = React;

/* ---------------- tiny icon set (no external icon lib needed) ---------------- */
const Icon = ({ children, size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);
const PlayIcon = (p) => <Icon {...p}><polygon points="5 3 19 12 5 21 5 3" /></Icon>;
const UploadIcon = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>;
const PlusIcon = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
const XIcon = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
const BugIcon = (p) => <Icon {...p}><rect x="8" y="6" width="8" height="14" rx="4" /><path d="M8 10H4M20 10h-4M8 14H3M21 14h-5M9 4l1.5 2M15 4l-1.5 2" /></Icon>;
const SparklesIcon = (p) => <Icon {...p}><path d="M12 2l1.6 4.6L18 8l-4.4 1.4L12 14l-1.6-4.6L6 8l4.4-1.4L12 2z" /></Icon>;
const AlertIcon = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
const InfoIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Icon>;
const LoaderIcon = (p) => <Icon {...p}><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></Icon>;
const SettingsIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>;
const ShieldIcon = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>;
const TerminalIcon = (p) => <Icon {...p}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></Icon>;
const RotateIcon = (p) => <Icon {...p}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></Icon>;

/* ---------------- constants ---------------- */
const SEVERITY_META = {
  critical: { label: "Critical", color: "var(--critical)", Icon: ShieldIcon },
  warning: { label: "Warning", color: "var(--warning)", Icon: AlertIcon },
  info: { label: "Suggestion", color: "var(--accent)", Icon: InfoIcon },
};
const CATEGORY_META = {
  bug: { label: "Bug / quality", Icon: BugIcon },
  style: { label: "Style / convention", Icon: SparklesIcon },
};
const SAMPLE_FILE = {
  id: "f1",
  name: "user_service.py",
  content: `import requests

def get_user(id):
    r = requests.get("https://api.example.com/users/" + id)
    data = r.json()
    return data

def calculate_discount(price, user_type):
    if user_type == "vip":
        return price * 0.8
    if user_type == "employee":
        return price*0.7
    else:
        return price

class userAccount:
    def __init__(self,name,balance):
        self.name=name
        self.balance = balance

    def withdraw(self, amt):
        self.balance = self.balance - amt
        return self.balance
`,
};
const STAGES = [
  { key: "scanning", label: "Parsing files & checking logic" },
  { key: "style", label: "Checking style & conventions" },
  { key: "drafting", label: "Drafting prioritized summary" },
];

/* ---------------- helpers ---------------- */
function extractJson(text) {
  if (!text) throw new Error("Empty response from model.");
  let cleaned = text.trim().replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callBackend(system, prompt, maxTokens = 1000) {
  const response = await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, prompt, maxTokens }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Server error (${response.status})`);
  return data;
}

let idCounter = 2;
const nextId = () => `f${idCounter++}`;

/* ---------------- small components ---------------- */
function LineNumberedEditor({ value, onChange, placeholder }) {
  const gutterRef = useRef(null);
  const areaRef = useRef(null);
  const lines = (value.match(/\n/g)?.length || 0) + 1;
  const syncScroll = () => { if (gutterRef.current && areaRef.current) gutterRef.current.scrollTop = areaRef.current.scrollTop; };
  return (
    <div className="editor-shell">
      <div className="gutter" ref={gutterRef}>
        {Array.from({ length: lines }, (_, i) => <div key={i} className="gutter-line">{i + 1}</div>)}
      </div>
      <textarea ref={areaRef} className="code-area" value={value} onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll} placeholder={placeholder} spellCheck={false} />
    </div>
  );
}

function StagePill({ stage, status }) {
  const order = STAGES.findIndex((s) => s.key === stage.key);
  const currentOrder = STAGES.findIndex((s) => s.key === status);
  const active = stage.key === status;
  const done = currentOrder > order || status === "done";
  return (
    <div className={`stage-pill ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <span className="stage-dot" />{stage.label}
    </div>
  );
}

/* ---------------- main app ---------------- */
function App() {
  const [files, setFiles] = useState([SAMPLE_FILE]);
  const [activeFileId, setActiveFileId] = useState(SAMPLE_FILE.id);
  const [status, setStatus] = useState("idle");
  const [issues, setIssues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const updateActiveContent = (content) => setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, content } : f)));
  const addFile = () => { const id = nextId(); setFiles((p) => [...p, { id, name: `file_${files.length + 1}.js`, content: "" }]); setActiveFileId(id); };
  const removeFile = (id) => setFiles((prev) => { const next = prev.filter((f) => f.id !== id); if (!next.length) return prev; if (id === activeFileId) setActiveFileId(next[0].id); return next; });
  const renameActive = (name) => setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, name } : f)));
  const handleUpload = (e) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => { const id = nextId(); setFiles((p) => [...p, { id, name: file.name, content: String(reader.result) }]); setActiveFileId(id); };
      reader.readAsText(file);
    });
    e.target.value = "";
  };

  const runReview = useCallback(async () => {
    setStatus("scanning"); setErrorText(""); setIssues([]); setSummary(null); setUsedFallback(false);
    const fileBlock = files.map((f) => `--- FILE: ${f.name} ---\n${f.content}`).join("\n\n");
    const sys1 = "You are an autonomous code review agent. Review the supplied files for (1) bugs, logic errors, and quality issues, and (2) style and convention issues. " +
      "Respond with ONLY valid JSON, no markdown fences, no commentary, matching this schema: " +
      '{"issues":[{"file":"string","line":number,"category":"bug"|"style","severity":"critical"|"warning"|"info","title":"short string","message":"1-2 sentence explanation","suggestion":"short concrete fix"}]}. ' +
      "Limit to the ~8 most important issues total, ordered by severity.";
    const user1 = `Review these files:\n\n${fileBlock}`;

    try {
      const res1 = await callBackend(sys1, user1);
      if (res1.usedFallback) setUsedFallback(true);
      setStatus("style");
      const parsed1 = extractJson(res1.text);
      const iss = (parsed1.issues || []).map((it, i) => ({ id: i, ...it }));
      setIssues(iss);

      setStatus("drafting");
      const sys2 = "You are the same autonomous code review agent, now synthesizing findings into a short executive summary for a developer. " +
        'Respond with ONLY valid JSON: {"riskScore": number 0-100, "summary": "1-2 sentence summary", "topActions": ["short action", "short action", "short action"]}.';
      const user2 = `Issues found:\n${JSON.stringify(iss.map(({ title, severity, category, file }) => ({ title, severity, category, file })))}`;
      try {
        const res2 = await callBackend(sys2, user2);
        setSummary(extractJson(res2.text));
      } catch { setSummary(null); }

      setStatus("done");
    } catch (e) {
      setErrorText(e.message || "Review failed.");
      setStatus("error");
    }
  }, [files]);

  const isRunning = status === "scanning" || status === "style" || status === "drafting";
  const grouped = files.map((f) => ({ file: f, fileIssues: issues.filter((i) => i.file === f.name) }));
  const counts = {
    critical: issues.filter((i) => i.severity === "critical").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  return (
    <div className="cra-root">
      <header className="cra-header">
        <div className="cra-title-block">
          <div className="eyebrow"><span className="blink" /> AUTONOMOUS AGENT · WEB REVIEWER</div>
          <div className="cra-title">Code Review Agent</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-icon" onClick={() => setShowSettings((s) => !s)} title="Settings"><SettingsIcon size={16} /></button>
          <button className="btn" onClick={() => fileInputRef.current?.click()}><UploadIcon size={15} /> Add files</button>
          <input ref={fileInputRef} type="file" multiple hidden onChange={handleUpload} />
          <button className="btn btn-primary" onClick={runReview} disabled={isRunning || files.every((f) => !f.content.trim())}>
            {isRunning ? <LoaderIcon size={15} className="spin" /> : <PlayIcon size={15} />}
            {isRunning ? "Reviewing…" : "Run review"}
          </button>
        </div>
      </header>

      <div className="cra-body">
        <div className="panel">
          <div className="panel-heading"><h2>Workspace</h2></div>
          <div className="tabs">
            {files.map((f) => (
              <div key={f.id} className={`tab ${f.id === activeFileId ? "active" : ""}`} onClick={() => setActiveFileId(f.id)}>
                {f.name}
                {files.length > 1 && <XIcon size={12} className="x" onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} />}
              </div>
            ))}
            <button className="tab-add" onClick={addFile} title="Add empty file"><PlusIcon size={14} /></button>
          </div>

          {activeFile && (
            <>
              <input className="filename-input mono" value={activeFile.name} onChange={(e) => renameActive(e.target.value)} />
              <div className={`editor-shell-wrap ${status === "scanning" ? "scanning" : ""}`}>
                <LineNumberedEditor value={activeFile.content} onChange={updateActiveContent} placeholder="Paste code here…" />
              </div>
            </>
          )}

          <div className="stages-row">{STAGES.map((s) => <StagePill key={s.key} stage={s} status={status} />)}</div>

          {showSettings && (
            <div className="settings-drawer">
              <div>Model fallback (used automatically if the Anthropic API call fails) is configured server-side via <code>FALLBACK_MODEL_URL</code> in <code>server/.env</code>. Restart the server after changing it.</div>
            </div>
          )}
        </div>

        <div className="panel panel-right">
          <div className="panel-heading">
            <h2>Review</h2>
            {status === "done" && <button className="btn btn-icon" onClick={runReview} title="Run again"><RotateIcon size={14} /></button>}
          </div>

          {status === "idle" && (
            <div className="empty-state"><TerminalIcon size={30} className="terminal-icon" /><div>No review yet — add code on the left and run the agent.</div></div>
          )}

          {isRunning && issues.length === 0 && (
            <div className="empty-state">
              <LoaderIcon size={26} className="spin terminal-icon" />
              <div>{STAGES.find((s) => s.key === status)?.label || "Working…"}</div>
              {usedFallback && <div className="fallback-note mono"><AlertIcon size={12} /> Claude API unavailable — using fallback model</div>}
            </div>
          )}

          {status === "error" && (
            <div className="error-box">
              <strong>Review failed</strong>
              <div>{errorText}</div>
              <button className="btn" onClick={runReview}><RotateIcon size={14} /> Try again</button>
            </div>
          )}

          {(status === "done" || (isRunning && issues.length > 0)) && (
            <>
              {summary && (
                <div className="summary-strip">
                  <div className="risk-row">
                    <div className="risk-score" style={{ color: summary.riskScore > 66 ? "var(--critical)" : summary.riskScore > 33 ? "var(--warning)" : "var(--good)" }}>{summary.riskScore}</div>
                    <div className="risk-bar"><div className="risk-bar-fill" style={{ width: `${summary.riskScore}%`, background: summary.riskScore > 66 ? "var(--critical)" : summary.riskScore > 33 ? "var(--warning)" : "var(--good)" }} /></div>
                  </div>
                  <div className="summary-text">{summary.summary}</div>
                  {summary.topActions?.length > 0 && (
                    <div className="top-actions">
                      {summary.topActions.map((a, i) => <div key={i} className="top-action"><span className="n">{String(i + 1).padStart(2, "0")}</span>{a}</div>)}
                    </div>
                  )}
                </div>
              )}

              <div className="counts-row">
                <div className="count-chip" style={{ borderColor: "var(--critical)" }}><span className="n" style={{ color: "var(--critical)" }}>{counts.critical}</span><span className="l">Critical</span></div>
                <div className="count-chip" style={{ borderColor: "var(--warning)" }}><span className="n" style={{ color: "var(--warning)" }}>{counts.warning}</span><span className="l">Warning</span></div>
                <div className="count-chip" style={{ borderColor: "var(--accent)" }}><span className="n" style={{ color: "var(--accent)" }}>{counts.info}</span><span className="l">Suggestion</span></div>
              </div>

              {issues.length === 0 && status === "done" && <div className="empty-state" style={{ padding: "30px 10px" }}>No issues found — clean pass.</div>}

              {grouped.filter((g) => g.fileIssues.length > 0).map(({ file, fileIssues }) => (
                <div className="file-group" key={file.id}>
                  <div className="file-group-name">{file.name}</div>
                  {fileIssues.map((issue, idx) => {
                    const sev = SEVERITY_META[issue.severity] || SEVERITY_META.info;
                    const cat = CATEGORY_META[issue.category] || CATEGORY_META.bug;
                    return (
                      <div className="issue-card" key={issue.id} style={{ animationDelay: `${idx * 0.06}s` }}>
                        <div className="issue-line mono">L{issue.line ?? "–"}</div>
                        <div className="issue-main">
                          <div className="issue-top">
                            <span className="sev-badge" style={{ color: sev.color, background: `${sev.color}22` }}><sev.Icon size={12} /> {sev.label}</span>
                            <span className="cat-badge"><cat.Icon size={11} /> {cat.label}</span>
                          </div>
                          <div className="issue-title">{issue.title}</div>
                          <div className="issue-message">{issue.message}</div>
                          {issue.suggestion && <div className="issue-suggestion">→ {issue.suggestion}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
