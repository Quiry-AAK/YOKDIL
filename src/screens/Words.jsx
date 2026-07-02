import { useState, useEffect, useRef } from "react";
import { useStore } from "../store.js";
import { analyzeWords, reformatWords } from "../lib/ai.js";
import { pickWeighted, shuffle } from "../lib/sr.js";

function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Words() {
  const settings = useStore((s) => s.settings);
  const words = useStore((s) => s.words);
  const pendingWords = useStore((s) => s.pendingWords);
  const clearPendingWords = useStore((s) => s.clearPendingWords);
  const removePendingWord = useStore((s) => s.removePendingWord);
  const addWord = useStore((s) => s.addWord);
  const importWords = useStore((s) => s.importWords);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const removeWord = useStore((s) => s.removeWord);
  const applyWordReformat = useStore((s) => s.applyWordReformat);

  const [mode, setMode] = useState("game");
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [importMsg, setImportMsg] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [fixMsg, setFixMsg] = useState(null);
  const importRef = useRef();

  const buildRound = () => {
    setPicked(null);
    const all = useStore.getState().words;
    if (!all.length) { setCurrent(null); return; }
    const word = pickWeighted(all, (w) => w.stats);
    const distractors = (word.distractors_tr || []).slice(0, 3);
    const opts = shuffle([word.meaning_tr, ...distractors]).map((t) => ({
      text: t, correct: t === word.meaning_tr,
    }));
    setCurrent(word); setChoices(opts);
  };

  useEffect(() => {
    if (mode === "game" && !current && words.length) buildRound();
  }, [mode, words.length]);

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    recordWordAnswer(current.word, opt.correct);
  };

  const onAnalyze = async () => {
    if (!settings.apiKey) { setAnalyzeError("Önce Ayarlar'dan API anahtarı ekle."); return; }
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const results = await analyzeWords({ apiKey: settings.apiKey, model: settings.model, words: pendingWords });
      results.forEach((w) => addWord(w));
      clearPendingWords();
    } catch (e) {
      setAnalyzeError(e.message || "Analiz başarısız.");
    } finally {
      setAnalyzing(false);
    }
  };

  const onFixFormat = async () => {
    if (!settings.apiKey) { setFixMsg("Önce Ayarlar'dan API anahtarı ekle."); return; }
    setFixing(true);
    setFixMsg(null);
    try {
      const fixed = await reformatWords({ apiKey: settings.apiKey, model: settings.model, words });
      applyWordReformat(fixed);
      setFixMsg(`${fixed.length} kelimenin şık formatı düzeltildi.`);
    } catch (e) {
      setFixMsg(e.message || "Düzeltme başarısız.");
    } finally {
      setFixing(false);
      setTimeout(() => setFixMsg(null), 3000);
    }
  };

  const onImport = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const arr = Array.isArray(data) ? data : data.words;
        const n = importWords(arr);
        setImportMsg(`${n} yeni kelime eklendi.`);
        setTimeout(() => setImportMsg(null), 2500);
      } catch { setImportMsg("Geçersiz JSON."); setTimeout(() => setImportMsg(null), 2500); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Kelimeler</h1>
        <div className="seg">
          <button className={mode === "game" ? "active" : ""} onClick={() => { setMode("game"); setCurrent(null); }}>Oyun</button>
          <button className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}>Liste ({words.length})</button>
        </div>
      </header>

      {pendingWords.length > 0 && (
        <div className="card pending-card">
          <p className="pending-title">Bekleyen kelimeler: <strong>{pendingWords.length}</strong></p>
          <div className="pending-chips">
            {pendingWords.map((w) => (
              <span key={w.word} className="pending-chip">
                {w.word}
                <button className="pending-chip-x" onClick={() => removePendingWord(w.word)}>✕</button>
              </span>
            ))}
          </div>
          {analyzeError && <div className="alert">{analyzeError}</div>}
          <button className="btn btn-primary" onClick={onAnalyze} disabled={analyzing}>
            {analyzing ? "Analiz ediliyor…" : `Gönder ve ekle (${pendingWords.length})`}
          </button>
        </div>
      )}

      {words.length === 0 && pendingWords.length === 0 && (
        <div className="empty">
          <p>Henüz kelime yok.</p>
          <p className="muted">Soru çözerken kelimelere dokun; buraya düşsünler.</p>
        </div>
      )}

      {mode === "list" && words.length > 0 && (
        <>
          <div className="io-row">
            <button className="btn btn-sm" onClick={() => exportJSON(words, "kelimeler.json")}>Dışa Aktar</button>
            <button className="btn btn-sm" onClick={() => importRef.current?.click()}>İçe Aktar</button>
            <input ref={importRef} type="file" accept=".json" hidden onChange={onImport} />
          </div>
          <div className="io-row">
            <button className="btn btn-sm btn-ghost" onClick={onFixFormat} disabled={fixing}>
              {fixing ? "Düzeltiliyor…" : "🔧 Şık Formatını Düzelt"}
            </button>
          </div>
          {importMsg && <div className="alert alert-ok">{importMsg}</div>}
          {fixMsg && <div className="alert alert-ok">{fixMsg}</div>}
          <div className="list">
            {words.map((w) => (
              <div key={w.word} className="card word-card">
                <div className="word-head">
                  <h3>{w.word}</h3>
                  <span className="pos-tag">{w.pos}</span>
                  <button className="icon-btn" onClick={() => removeWord(w.word)}>🗑</button>
                </div>
                <p className="meaning">{w.meaning_tr}</p>
                <p className="example">"{w.example_en}"</p>
                <p className="example-tr muted">{w.example_tr}</p>
                <span className="muted small">görülme: {w.stats.seen} · doğru: {w.stats.correct}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {mode === "game" && current && (
        <div className="card game-card">
          <div className="game-word">{current.word}</div>
          <p className="muted">Anlamı hangisi?</p>
          <div className="options">
            {choices.map((opt, i) => {
              let cls = "option";
              if (picked) { if (opt.correct) cls += " correct"; else if (opt === picked) cls += " wrong"; }
              return (
                <button key={i} className={cls} disabled={!!picked} onClick={() => pick(opt)}>
                  <span className="opt-text">{opt.text}</span>
                </button>
              );
            })}
          </div>
          {picked && (
            <div className="reveal">
              <div className={"feedback " + (picked.correct ? "good" : "bad")}>
                {picked.correct ? "✓ Doğru!" : "✗ Yanlış."}
              </div>
              <div className="reveal-detail">
                <span className="pos-tag">{current.pos}</span>
                <p className="meaning">{current.word} = {current.meaning_tr}</p>
                <p className="example">"{current.example_en}"</p>
                <p className="example-tr muted">{current.example_tr}</p>
              </div>
              <button className="btn btn-primary btn-big" onClick={buildRound}>Sonraki Kelime →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
