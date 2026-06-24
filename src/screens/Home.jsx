import { useRef, useState } from "react";
import { useStore } from "../store.js";
import { EXTRACT_PROMPT } from "../lib/ai.js";

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
  const [renamingId, setRenamingId] = useState(null);
  const [renamingName, setRenamingName] = useState("");
  const fileRef = useRef();
  const [fileName, setFileName] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setJsonText("");
    setError(null);
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
    const id = addDeneme(name, questions);
    setFileName(null);
    setJsonText("");
    navigate("solve", id);
  };

  const onCancel = () => {
    setFileName(null);
    setJsonText("");
    setError(null);
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
          const correct = d.questions.filter(
            (q) => q.userAnswer && q.userAnswer === q.answer
          ).length;
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
                <p className="muted">
                  {d.questions.length} soru · {answered} cevaplandı · {correct} doğru
                </p>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${(answered / d.questions.length) * 100}%` }} />
                </div>
              </div>
              <div className="deneme-actions">
                <button className="icon-btn" title="İsim değiştir" onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(d.id);
                  setRenamingName(d.name);
                }}>✏️</button>
                <button className="icon-btn" title="Dışa aktar" onClick={(e) => {
                  e.stopPropagation();
                  exportJSON(d, `${d.name}.json`);
                }}>⬇️</button>
                <button className="icon-btn" title="Denemeyi sil" onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`"${d.name}" silinsin mi?`)) removeDeneme(d.id);
                }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
