import { useRef, useState } from "react";
import { useStore } from "../store.js";
import { EXTRACT_PROMPT } from "../lib/ai.js";
import { getCategory, CAT_ORDER } from "../lib/categories.js";

function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Home({ navigate }) {
  const denemes = useStore((s) => s.denemes);
  const addDeneme = useStore((s) => s.addDeneme);
  const removeDeneme = useStore((s) => s.removeDeneme);
  const renameDeneme = useStore((s) => s.renameDeneme);
  const setDenemeType = useStore((s) => s.setDenemeType);
  const updateDenemeQuestions = useStore((s) => s.updateDenemeQuestions);
  const [renamingId, setRenamingId] = useState(null);
  const [renamingName, setRenamingName] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateJson, setUpdateJson] = useState("");
  const [updateError, setUpdateError] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const fileRef = useRef();
  const [fileName, setFileName] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [dType, setDType] = useState("yokdil");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setJsonText("");
    setError(null);
    setDType("yokdil");
  };

  const onCopy = () => {
    navigator.clipboard.writeText(EXTRACT_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = () => {
    setError(null);
    let data;
    try {
      data = JSON.parse(jsonText.trim());
    } catch {
      setError("Geçersiz JSON. Claude'un çıktısını tam ve değiştirmeden yapıştır.");
      return;
    }
    const questions = Array.isArray(data) ? data : data.questions;
    if (!Array.isArray(questions) || !questions.length) {
      setError("Sorular bulunamadı. Claude'un verdiği JSON'un içinde \"questions\" dizisi olmalı.");
      return;
    }
    const name = fileName.replace(/\.pdf$/i, "");
    const id = addDeneme(name, questions, dType);
    setFileName(null);
    setJsonText("");
    navigate("solve", id);
  };

  const onCancel = () => {
    setFileName(null);
    setJsonText("");
    setError(null);
  };

  const onUpdateSubmit = (denemeId) => {
    setUpdateError(null);
    let data;
    try {
      data = JSON.parse(updateJson.trim());
    } catch {
      setUpdateError("Geçersiz JSON.");
      return;
    }
    const questions = Array.isArray(data) ? data : data.questions;
    if (!Array.isArray(questions) || !questions.length) {
      setUpdateError("JSON içinde \"questions\" dizisi bulunamadı.");
      return;
    }
    updateDenemeQuestions(denemeId, questions);
    setUpdatingId(null);
    setUpdateJson("");
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Denemelerim</h1>
        <p className="muted">PDF'i Claude.ai'ye yükle, JSON'u yapıştır, çöz.</p>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={onPick}
      />

      {fileName ? (
        <div className="card claude-card">
          <p className="claude-filename">📄 {fileName}</p>
          <ol className="claude-steps">
            <li>Bu PDF'i <strong>claude.ai</strong>'ye yükle</li>
            <li>Aşağıdaki promptu kopyalayıp yapıştır ve gönder</li>
            <li>Claude'un verdiği JSON'u altta yapıştır</li>
          </ol>
          <div className="prompt-box">
            <pre className="prompt-text">{EXTRACT_PROMPT}</pre>
            <button className="btn btn-sm prompt-copy-btn" onClick={onCopy}>
              {copied ? "✓ Kopyalandı" : "Kopyala"}
            </button>
          </div>
          <div className="type-row">
            <span className="muted small">Sınav türü:</span>
            <div className="seg">
              <button className={dType === "yokdil" ? "active" : ""} onClick={() => setDType("yokdil")}>YÖKDİL</button>
              <button className={dType === "yds" ? "active" : ""} onClick={() => setDType("yds")}>YDS</button>
            </div>
          </div>
          <textarea
            className="input json-paste"
            placeholder="Claude'un JSON çıktısını buraya yapıştır…"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={6}
          />
          {error && <div className="alert">{error}</div>}
          <div className="claude-actions">
            <button className="btn btn-ghost" onClick={onCancel}>İptal</button>
            <button
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={!jsonText.trim()}
            >
              Devam Et →
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-primary btn-big"
          onClick={() => fileRef.current?.click()}
        >
          ＋ Deneme PDF Yükle
        </button>
      )}

      {denemes.length === 0 && !fileName && (
        <div className="empty">
          <p>Henüz deneme yok.</p>
          <p className="muted">
            Yukarıdan bir YÖKDİL/YDS deneme PDF'i seç. Cevap anahtarı son
            sayfada olsun — Claude onu okuyup soruları JSON'a çevirecek.
          </p>
        </div>
      )}

      <div className="list">
        {denemes.map((d) => {
          const answered = d.questions.filter((q) => q.userAnswer).length;
          const correct = d.questions.filter((q) => q.userAnswer && q.userAnswer === q.answer).length;
          const wrong = answered - correct;
          const score = answered ? (correct * 1.25).toFixed(2) : null;
          const isRenaming = renamingId === d.id;
          return (
            <div key={d.id} className="card deneme-card">
              <div className="deneme-info" onClick={() => !isRenaming && navigate("solve", d.id)}>
                {isRenaming ? (
                  <div className="rename-row" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="input rename-input"
                      value={renamingName}
                      autoFocus
                      onChange={(e) => setRenamingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && renamingName.trim()) {
                          renameDeneme(d.id, renamingName.trim());
                          setRenamingId(null);
                        } else if (e.key === "Escape") setRenamingId(null);
                      }}
                    />
                    <button className="btn btn-sm btn-primary" onClick={() => {
                      if (renamingName.trim()) renameDeneme(d.id, renamingName.trim());
                      setRenamingId(null);
                    }}>✓</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setRenamingId(null)}>✕</button>
                  </div>
                ) : (
                  <h3>{d.name}</h3>
                )}
                <p className="muted small">
                  {d.questions.length} soru · {answered} cevaplandı
                  {answered > 0 && <> · <span style={{ color: "var(--good)" }}>✓{correct}</span> <span style={{ color: "var(--bad)" }}>✗{wrong}</span> · <strong style={{ color: "var(--primary2)" }}>{score} puan</strong></>}
                </p>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${(answered / d.questions.length) * 100}%` }} />
                </div>
              </div>
              <div className="deneme-actions">
                <button
                  className={"btn btn-sm type-badge" + (d.type === "yds" ? " type-yds" : " type-yokdil")}
                  title="Sınav türünü değiştir"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDenemeType(d.id, d.type === "yds" ? "yokdil" : "yds");
                  }}
                >
                  {d.type === "yds" ? "YDS" : "YÖKDİL"}
                </button>
                <button className="icon-btn" title="İsim değiştir" onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(d.id);
                  setRenamingName(d.name);
                }}>✏️</button>
                <button className="icon-btn" title="Analiz" onClick={(e) => {
                  e.stopPropagation();
                  setAnalysisId(analysisId === d.id ? null : d.id);
                }}>📊</button>
                {answered > 0 && (
                  <button className="icon-btn" title="Sonuç Raporu" onClick={(e) => {
                    e.stopPropagation();
                    navigate("denemeReport", d.id);
                  }}>🧾</button>
                )}
                <button className="icon-btn" title="JSON güncelle" onClick={(e) => {
                  e.stopPropagation();
                  setUpdatingId(updatingId === d.id ? null : d.id);
                  setUpdateJson("");
                  setUpdateError(null);
                }}>🔄</button>
                <button className="icon-btn" title="Dışa aktar" onClick={(e) => {
                  e.stopPropagation();
                  exportJSON(d, `${d.name}.json`);
                }}>⬇️</button>
                <button className="icon-btn" title="Denemeyi sil" onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`"${d.name}" silinsin mi?`)) removeDeneme(d.id);
                }}>🗑</button>
              </div>
              {analysisId === d.id && (() => {
                const catStats = {};
                d.questions.forEach((q) => {
                  if (!q.userAnswer) return;
                  const cat = getCategory(q.number, d.type);
                  if (!catStats[cat]) catStats[cat] = { correct: 0, wrong: 0 };
                  if (q.userAnswer === q.answer) catStats[cat].correct++;
                  else catStats[cat].wrong++;
                });
                const rows = CAT_ORDER.filter((c) => catStats[c])
                  .map((c) => ({ label: c, ...catStats[c] }))
                  .sort((a, b) => b.wrong - a.wrong);
                return rows.length === 0 ? null : (
                  <div className="analysis-box" onClick={(e) => e.stopPropagation()}>
                    {rows.map(({ label, correct: cr, wrong: wr }) => {
                      const catPct = Math.round((cr / (cr + wr)) * 100);
                      return (
                        <div key={label} className="analysis-row">
                          <span className="analysis-label">{label}</span>
                          <span className="analysis-vals">
                            <span style={{ color: "var(--good)" }}>✓{cr}</span>
                            {" "}
                            <span style={{ color: "var(--bad)" }}>✗{wr}</span>
                            {" "}
                            <span className="muted">%{catPct}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              {updatingId === d.id && (
                <div className="update-json-box" onClick={(e) => e.stopPropagation()}>
                  <p className="muted small" style={{ margin: "0 0 6px" }}>
                    Güncel JSON'u yapıştır — soru numarasına göre eşleştirilir, verdiğin cevaplar korunur.
                  </p>
                  <textarea
                    className="input json-paste"
                    placeholder='{"questions":[...]}'
                    value={updateJson}
                    onChange={(e) => setUpdateJson(e.target.value)}
                    rows={4}
                  />
                  {updateError && <div className="alert">{updateError}</div>}
                  <div className="claude-actions" style={{ marginTop: 8 }}>
                    <button className="btn btn-ghost" onClick={() => { setUpdatingId(null); setUpdateJson(""); }}>İptal</button>
                    <button className="btn btn-primary" disabled={!updateJson.trim()} onClick={() => onUpdateSubmit(d.id)}>Güncelle</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
