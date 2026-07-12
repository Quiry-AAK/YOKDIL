import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { PHRASAL_VERBS, PREP_VERBS, GERUND_INFINITIVE, NOUN_PREP_PATTERNS } from "../lib/vocabPatterns.js";
import { shuffle } from "../lib/sr.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";

const CATEGORIES = [
  { key: "phrasal", label: "Phrasal Verbs", list: PHRASAL_VERBS, itemKey: (it) => it.phrase },
  { key: "prep", label: "Edatlı Fiiller", list: PREP_VERBS, itemKey: (it) => it.phrase },
  { key: "gerund", label: "Gerund / Infinitive", list: GERUND_INFINITIVE, itemKey: (it) => it.verb },
  { key: "collocation", label: "Kalıp İfadeler", list: NOUN_PREP_PATTERNS, itemKey: (it) => it.phrase },
];

function buildMeaningQuestion(item, list) {
  const distractorPool = list.filter((x) => x.phrase !== item.phrase);
  const wrongOnes = shuffle(distractorPool).slice(0, 3).map((x) => x.meaning);
  const options = shuffle([item.meaning, ...wrongOnes]).map((text) => ({
    text, correct: text === item.meaning,
  }));
  return { kind: "meaning", options };
}

function buildBlankQuestion(item) {
  const options = shuffle([
    { text: item.correct, correct: true },
    { text: item.wrong, correct: false },
  ]);
  return { kind: "blank", options };
}

export default function PatternQuiz() {
  const patternStats = useStore((s) => s.patternStats);
  const recordPatternAnswer = useStore((s) => s.recordPatternAnswer);

  const [cat, setCat] = useState(null);
  const [stage, setStage] = useState("category"); // category | size | play | score
  const round = useRound();
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);

  const category = CATEGORIES.find((c) => c.key === cat);

  const statKey = (it) => `${cat}:${category.itemKey(it)}`;
  const statsOf = (it) => patternStats[statKey(it)] || { seen: 0, correct: 0 };

  useEffect(() => {
    if (!round.current) { setQuestion(null); return; }
    setQuestion(cat === "phrasal" ? buildMeaningQuestion(round.current, category.list) : buildBlankQuestion(round.current));
    setPicked(null);
  }, [round.current]);

  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const startCategory = (c) => {
    setCat(c.key);
    setStage("size");
  };

  const startRound = (n) => {
    const pool = pickLeastSeen(category.list, statsOf, n);
    round.start(pool, statKey);
    setStage("play");
  };

  const choose = (opt) => {
    if (picked) return;
    setPicked(opt);
    recordPatternAnswer(statKey(round.current), opt.correct);
  };

  const onNext = () => {
    round.answer(picked.correct);
  };

  if (stage === "category") {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Kalıp Quiz</h1>
          <p className="muted">Phrasal verb, edatlı fiil ve gerund/infinitive kalıplarını test et.</p>
        </header>
        <div className="list">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="card cat-pick-card" onClick={() => startCategory(c)}>
              <div className="cat-pick-label">{c.label}</div>
              <div className="cat-pick-sub muted small">{c.list.length} kalıp</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "size") {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("category")}>← {category.label}</button>
        </header>
        <p className="muted" style={{ marginBottom: 12 }}>Kaç tanesini çalışmak istiyorsun? En az görülenler önce gelir.</p>
        <div className="list">
          {roundSizeChoices(category.list.length).map((n) => (
            <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
              <div className="cat-pick-label">{n === category.list.length ? `Tümü (${n})` : `${n} soru`}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "score") {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("category")}>← {category.label}</button>
        </header>
        <div className="card score-card">
          <div className="score-big">%{round.total ? Math.round((round.firstTryCorrect / round.total) * 100) : 0}</div>
          <p className="muted small" style={{ margin: "-12px 0 16px" }}>tur puanı (ilk denemede doğru oranı)</p>
          <div className="score-row"><span className="score-label">Soru sayısı</span><span className="score-val">{round.total}</span></div>
          <div className="score-row"><span className="score-label">İlk denemede doğru</span><span className="score-val good">{round.firstTryCorrect}</span></div>
          <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
        </div>
      </div>
    );
  }

  // ---- stage === "play" ----
  if (!round.current || !question) return null;
  const item = round.current;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setStage("category")}>← {category.label}</button>
        <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
      </header>

      {question.kind === "meaning" && (
        <div className="card game-card">
          <div className="game-word">{item.phrase}</div>
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
                <p className="meaning">{item.phrase} = {item.meaning}</p>
                <p className="example">"{item.example.en}"</p>
                <p className="example-tr muted">{item.example.tr}</p>
              </div>
              <button className="btn btn-primary btn-big" onClick={onNext}>Sonraki →</button>
            </div>
          )}
        </div>
      )}

      {question.kind === "blank" && (
        <div className="card game-card">
          <p className="muted" style={{ marginBottom: 6 }}>{item.meaning_tr ?? item.meaning}</p>
          <div className="blank-sentence">
            {item.before}{" "}
            <span className="blank-slot">{picked ? picked.text : "______"}</span>{" "}
            {item.after}
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
                {picked.correct ? "✓ Doğru!" : `✗ Yanlış. Doğrusu: ${item.correct}`}
              </div>
              {item.note && (
                <div className="reveal-detail">
                  <p className="example-tr muted" style={{ margin: 0 }}>{item.note}</p>
                </div>
              )}
              <button className="btn btn-primary btn-big" onClick={onNext}>Sonraki →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
