import { useState } from "react";
import { PHRASAL_VERBS, PREP_VERBS, GERUND_INFINITIVE, NOUN_PREP_PATTERNS } from "../lib/vocabPatterns.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CATEGORIES = [
  { key: "phrasal", label: "Phrasal Verbs", sub: `${PHRASAL_VERBS.length} kalıp` },
  { key: "prep", label: "Edatlı Fiiller", sub: `${PREP_VERBS.length} kalıp` },
  { key: "gerund", label: "Gerund / Infinitive", sub: `${GERUND_INFINITIVE.length} fiil` },
  { key: "collocation", label: "Kalıp İfadeler", sub: `${NOUN_PREP_PATTERNS.length} kalıp` },
];

function buildMeaningQuestion(list) {
  const item = pickRandom(list);
  const distractorPool = list.filter((x) => x.phrase !== item.phrase);
  const wrongOnes = shuffle(distractorPool).slice(0, 3).map((x) => x.meaning);
  const options = shuffle([item.meaning, ...wrongOnes]).map((text) => ({
    text,
    correct: text === item.meaning,
  }));
  return { kind: "meaning", item, options };
}

function buildBlankQuestion(list) {
  const item = pickRandom(list);
  const options = shuffle([
    { text: item.correct, correct: true },
    { text: item.wrong, correct: false },
  ]);
  return { kind: "blank", item, options };
}

export default function PatternQuiz() {
  const [cat, setCat] = useState(null);
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const listFor = (c) =>
    c === "phrasal" ? PHRASAL_VERBS
    : c === "prep" ? PREP_VERBS
    : c === "collocation" ? NOUN_PREP_PATTERNS
    : GERUND_INFINITIVE;

  const next = (c) => {
    const list = listFor(c ?? cat);
    const q = (c ?? cat) === "phrasal" ? buildMeaningQuestion(list) : buildBlankQuestion(list);
    setQuestion(q);
    setPicked(null);
  };

  const startCategory = (c) => {
    setCat(c);
    setScore({ correct: 0, total: 0 });
    next(c);
  };

  const choose = (opt) => {
    if (picked) return;
    setPicked(opt);
    setScore((s) => ({ correct: s.correct + (opt.correct ? 1 : 0), total: s.total + 1 }));
  };

  if (!cat) {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Kalıp Quiz</h1>
          <p className="muted">Phrasal verb, edatlı fiil ve gerund/infinitive kalıplarını test et.</p>
        </header>
        <div className="list">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="card cat-pick-card" onClick={() => startCategory(c.key)}>
              <div className="cat-pick-label">{c.label}</div>
              <div className="cat-pick-sub muted small">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const catLabel = CATEGORIES.find((c) => c.key === cat)?.label;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setCat(null)}>← {catLabel}</button>
        <span className="muted small">{score.correct}/{score.total} doğru</span>
      </header>

      {question?.kind === "meaning" && (
        <div className="card game-card">
          <div className="game-word">{question.item.phrase}</div>
          <p className="muted">Anlamı hangisi?</p>
          <div className="options">
            {question.options.map((opt, i) => {
              let cls = "option";
              if (picked) { if (opt.correct) cls += " correct"; else if (opt === picked) cls += " wrong"; }
              return (
                <button key={i} className={cls} disabled={!!picked} onClick={() => choose(opt)}>
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
                <p className="meaning">{question.item.phrase} = {question.item.meaning}</p>
                <p className="example">"{question.item.example.en}"</p>
                <p className="example-tr muted">{question.item.example.tr}</p>
              </div>
              <button className="btn btn-primary btn-big" onClick={() => next()}>Sonraki →</button>
            </div>
          )}
        </div>
      )}

      {question?.kind === "blank" && (
        <div className="card game-card">
          <p className="muted" style={{ marginBottom: 6 }}>{question.item.meaning_tr ?? question.item.meaning}</p>
          <div className="blank-sentence">
            {question.item.before}{" "}
            <span className="blank-slot">{picked ? picked.text : "______"}</span>{" "}
            {question.item.after}
          </div>
          <div className="options" style={{ marginTop: 16 }}>
            {question.options.map((opt, i) => {
              let cls = "option";
              if (picked) { if (opt.correct) cls += " correct"; else if (opt === picked) cls += " wrong"; }
              return (
                <button key={i} className={cls} disabled={!!picked} onClick={() => choose(opt)}>
                  <span className="opt-text">{opt.text}</span>
                </button>
              );
            })}
          </div>
          {picked && (
            <div className="reveal">
              <div className={"feedback " + (picked.correct ? "good" : "bad")}>
                {picked.correct ? "✓ Doğru!" : `✗ Yanlış. Doğrusu: ${question.item.correct}`}
              </div>
              {question.item.note && (
                <div className="reveal-detail">
                  <p className="example-tr muted" style={{ margin: 0 }}>{question.item.note}</p>
                </div>
              )}
              <button className="btn btn-primary btn-big" onClick={() => next()}>Sonraki →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
