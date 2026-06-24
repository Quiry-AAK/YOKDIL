import { useRef, useState } from "react";
import { useStore } from "../store.js";
import { EXTRACT_PROMPT } from "../lib/ai.js";

export default function Home({ navigate }) {
  const denemes = useStore((s) => s.denemes);
  const addDeneme = useStore((s) => s.addDeneme);
  const removeDeneme = useStore((s) => s.removeDeneme);
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
            placeholder='Claude\'un JSON çıktısını buraya yapıştır…'
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
          return (
            <div key={d.id} className="card deneme-card">
              <div className="deneme-info" onClick={() => navigate("solve", d.id)}>
                <h3>{d.name}</h3>
                <p className="muted">
                  {d.questions.length} soru · {answered} cevaplandı · {correct} doğru
                </p>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${(answered / d.questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <button
                className="icon-btn"
                title="Denemeyi sil"
                onClick={() => {
                  if (confirm(`"${d.name}" silinsin mi?`)) removeDeneme(d.id);
                }}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
