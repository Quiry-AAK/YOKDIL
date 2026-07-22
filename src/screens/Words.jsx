import { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from "../store.js";
import { analyzeWords } from "../lib/ai.js";
import { shuffle } from "../lib/sr.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";
import { buildWordGroups } from "../lib/wordSources.js";

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
  const academicWordStats = useStore((s) => s.academicWordStats);
  const recordAcademicWordAnswer = useStore((s) => s.recordAcademicWordAnswer);
  const removeWord = useStore((s) => s.removeWord);
  const addPendingWord = useStore((s) => s.addPendingWord);
  const groups = useMemo(() => buildWordGroups(words, academicWordStats), [words, academicWordStats]);

  const [mode, setMode] = useState("game");
  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const round = useRound();
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [importMsg, setImportMsg] = useState(null);
  const importRef = useRef();
  const [manualWord, setManualWord] = useState("");
  const [manualTag, setManualTag] = useState("yokdil");
  const [manualMsg, setManualMsg] = useState(null);

  useEffect(() => {
    if (!round.current) { setChoices([]); return; }
    const distractors = (round.current.distractors_tr || []).slice(0, 3);
    setChoices(shuffle([round.current.meaning_tr, ...distractors]).map((t) => ({
      text: t, correct: t === round.current.meaning_tr,
    })));
    setPicked(null);
  }, [round.current]);

  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const poolFor = (key) => groups.find((g) => g.key === key)?.pool ?? [];
  const activeKind = groups.find((g) => g.key === group)?.kind;
  const recordAnswer = (word, correct) => {
    if (activeKind === "academic") recordAcademicWordAnswer(word, correct);
    else recordWordAnswer(word, correct);
  };

  const startGroup = (g) => {
    setGroup(g);
    setStage("size");
  };

  const startRound = (n) => {
    const pool = pickLeastSeen(poolFor(group), (w) => w.stats, n);
    round.start(pool, (w) => w.word);
    setStage("play");
  };

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    recordAnswer(round.current.word, opt.correct);
  };

  const onNext = () => {
    round.answer(picked.correct);
  };

  const onAnalyze = async () => {
    if (!settings.apiKey) { setAnalyzeError("Önce Ayarlar'dan API anahtarı ekle."); return; }
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const results = await analyzeWords({ apiKey: settings.apiKey, model: settings.model, words: pendingWords });
      results.forEach((w) => {
        const pw = pendingWords.find((p) => p.word === w.word);
        addWord({ ...w, sourceType: pw?.sourceType ?? null });
      });
      clearPendingWords();
    } catch (e) {
      setAnalyzeError(e.message || "Analiz başarısız.");
    } finally {
      setAnalyzing(false);
    }
  };

  const submitManual = () => {
    const w = manualWord.trim().toLowerCase();
    if (!w) return;
    const added = addPendingWord(w, null, manualTag);
    setManualWord("");
    setManualMsg(added ? `✓ "${w}" bekleme listesine eklendi.` : `"${w}" zaten ekli.`);
    setTimeout(() => setManualMsg(null), 2200);
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
          <button className={mode === "game" ? "active" : ""} onClick={() => { setMode("game"); setStage("group"); }}>Oyun</button>
          <button className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}>Liste ({words.length})</button>
        </div>
      </header>

      <div className="card">
        <p className="muted small" style={{ marginBottom: 8 }}>Dışarıdan kelime ekle</p>
        <div className="row">
          <input
            type="text"
            className="input"
            placeholder="ör. ambiguous"
            value={manualWord}
            onChange={(e) => setManualWord(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitManual(); }}
          />
          <button className="btn btn-primary" onClick={submitManual}>Ekle</button>
        </div>
        <div className="seg seg-wrap">
          {[
            { key: "yokdil", label: "YÖKDİL" },
            { key: "yds", label: "YDS" },
            { key: "diger", label: "Diğer" },
          ].map((t) => (
            <button key={t.key} className={manualTag === t.key ? "active" : ""} onClick={() => setManualTag(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {manualMsg && <p className="muted small" style={{ marginTop: 6 }}>{manualMsg}</p>}
      </div>

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

      {mode === "list" && words.length === 0 && pendingWords.length === 0 && (
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
          {importMsg && <div className="alert alert-ok">{importMsg}</div>}
          <div className="list">
            {words.map((w) => (
              <div key={w.word} className="card word-card">
                <div className="word-head">
                  <h3>{w.word}</h3>
                  <span className="pos-tag">{w.pos}</span>
                  {w.sourceType && (
                    <span className="source-tag">
                      {w.sourceType === "yds" ? "YDS" : w.sourceType === "diger" ? "Diğer" : "YÖKDİL"}
                    </span>
                  )}
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

      {mode === "game" && stage === "group" && (
        <div className="list">
          <p className="muted" style={{ marginBottom: 12 }}>Hangi kelimelerle çalışmak istiyorsun?</p>
          {groups.map((g) => {
            const count = poolFor(g.key).length;
            return (
              <div
                key={g.key}
                className={"card cat-pick-card" + (count === 0 ? " disabled" : "")}
                onClick={() => count > 0 && startGroup(g.key)}
              >
                <div className="cat-pick-label">{g.label}</div>
                <div className="cat-pick-sub muted small">{count} kelime</div>
              </div>
            );
          })}
        </div>
      )}

      {mode === "game" && stage === "size" && (
        <div className="list">
          <p className="muted" style={{ marginBottom: 12 }}>Kaç kelime çalışmak istiyorsun? En az görülenler önce gelir.</p>
          {roundSizeChoices(poolFor(group).length).map((n) => (
            <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
              <div className="cat-pick-label">{n === poolFor(group).length ? `Tümü (${n})` : `${n} kelime`}</div>
            </div>
          ))}
        </div>
      )}

      {mode === "game" && stage === "play" && round.current && (
        <>
          <p className="muted small" style={{ marginBottom: 8 }}>Kalan: {round.remaining} / {round.total}</p>
          <div className="card game-card">
            <div className="game-word">{round.current.word}</div>
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
                  <span className="pos-tag">{round.current.pos}</span>
                  <p className="meaning">{round.current.word} = {round.current.meaning_tr}</p>
                  <p className="example">"{round.current.example_en}"</p>
                  <p className="example-tr muted">{round.current.example_tr}</p>
                </div>
                <button className="btn btn-primary btn-big" onClick={onNext}>Sonraki Kelime →</button>
              </div>
            )}
          </div>
        </>
      )}

      {mode === "game" && stage === "score" && (
        <div className="card score-card">
          <div className="score-big">%{round.total ? Math.round((round.firstTryCorrect / round.total) * 100) : 0}</div>
          <p className="muted small" style={{ margin: "-12px 0 16px" }}>tur puanı (ilk denemede doğru oranı)</p>
          <div className="score-row"><span className="score-label">Kelime sayısı</span><span className="score-val">{round.total}</span></div>
          <div className="score-row"><span className="score-label">İlk denemede doğru</span><span className="score-val good">{round.firstTryCorrect}</span></div>
          <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("group")}>Yeni Tur</button>
        </div>
      )}
    </div>
  );
}
