import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { pickWeighted, shuffle } from "../lib/sr.js";

export default function Words() {
  const words = useStore((s) => s.words);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const removeWord = useStore((s) => s.removeWord);
  const [mode, setMode] = useState("game"); // "game" | "list"
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);

  const buildRound = () => {
    setPicked(null);
    const all = useStore.getState().words;
    if (!all.length) {
      setCurrent(null);
      return;
    }
    const word = pickWeighted(all, (w) => w.stats);
    const distractors = (word.distractors_tr || []).slice(0, 3);
    const opts = shuffle([word.meaning_tr, ...distractors]).map((t) => ({
      text: t,
      correct: t === word.meaning_tr,
    }));
    setCurrent(word);
    setChoices(opts);
  };

  useEffect(() => {
    if (mode === "game" && !current && words.length) buildRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, words.length]);

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    recordWordAnswer(current.word, opt.correct);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Kelimeler</h1>
        <div className="seg">
          <button
            className={mode === "game" ? "active" : ""}
            onClick={() => { setMode("game"); setCurrent(null); }}
          >
            Oyun
          </button>
          <button
            className={mode === "list" ? "active" : ""}
            onClick={() => setMode("list")}
          >
            Liste ({words.length})
          </button>
        </div>
      </header>

      {words.length === 0 && (
        <div className="empty">
          <p>Henüz kelime yok.</p>
          <p className="muted">
            Soru çözerken İngilizce kelimelere dokun; buraya açıklamalı olarak düşsünler.
          </p>
        </div>
      )}

      {mode === "list" && words.length > 0 && (
        <div className="list">
          {words.map((w) => (
            <div key={w.word} className="card word-card">
              <div className="word-head">
                <h3>{w.word}</h3>
                <span className="pos-tag">{w.pos}</span>
                <button className="icon-btn" onClick={() => removeWord(w.word)}>🗑</button>
              </div>
              <p className="meaning">{w.meaning_tr}</p>
              <p className="example">“{w.example_en}”</p>
              <p className="example-tr muted">{w.example_tr}</p>
              <span className="muted small">
                görülme: {w.stats.seen} · doğru: {w.stats.correct}
              </span>
            </div>
          ))}
        </div>
      )}

      {mode === "game" && current && (
        <div className="card game-card">
          <div className="game-word">{current.word}</div>
          <p className="muted">Anlamı hangisi?</p>

          <div className="options">
            {choices.map((opt, i) => {
              let cls = "option";
              if (picked) {
                if (opt.correct) cls += " correct";
                else if (opt === picked) cls += " wrong";
              }
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
                <p className="example">“{current.example_en}”</p>
                <p className="example-tr muted">{current.example_tr}</p>
              </div>
              <button className="btn btn-primary btn-big" onClick={buildRound}>
                Sonraki Kelime →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
