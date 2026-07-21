import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { TOPICS } from "../lib/topics.js";
import { shuffle } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";

const LETTERS = ["A", "B", "C", "D", "E"];

function groupByPassage(questions) {
  const groups = {};
  questions.forEach((q, i) => {
    if (!groups[q.groupLabel]) groups[q.groupLabel] = [];
    groups[q.groupLabel].push({ ...q, __idx: i });
  });
  return Object.entries(groups); // [[label, [q,q,...]], ...]
}

function highlightBlank(passage, blankNum) {
  const marker = `(${blankNum}) ______`;
  const idx = passage.indexOf(marker);
  if (idx === -1) return passage;
  return (
    <>
      {passage.slice(0, idx)}
      <span className="cloze-active-blank">{marker}</span>
      {passage.slice(idx + marker.length)}
    </>
  );
}

export default function ClozeGame() {
  const topic = TOPICS.find((t) => t.key === "cloze-test");
  const examStats = useStore((s) => s.examStats);
  const recordExamAnswer = useStore((s) => s.recordExamAnswer);

  const [stage, setStage] = useState("size"); // size | play | score
  const round = useRound();
  const [picked, setPicked] = useState(null);

  const passages = groupByPassage(topic.questions);
  const statKey = (it) => `cloze:${it.__idx}`;

  useEffect(() => { setPicked(null); }, [round.current]);
  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const startRound = (n) => {
    const chosen = shuffle(passages).slice(0, n);
    const flat = chosen.flatMap(([, qs]) => qs);
    round.start(flat, statKey, { shuffleItems: false });
    setStage("play");
  };

  const choose = (letter) => {
    if (picked) return;
    setPicked(letter);
    recordExamAnswer(statKey(round.current), letter === round.current.answer);
  };

  const onNext = () => {
    round.answer(picked === round.current.answer);
  };

  if (stage === "size") {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Cloze Test</h1>
          <p className="muted">Parça boyunca boşlukları sırayla dolduruyorsun, parça sabit kalır.</p>
        </header>
        <p className="muted" style={{ marginBottom: 12 }}>Kaç parça çalışmak istiyorsun?</p>
        <div className="list">
          {[1, passages.length].filter((n, i, arr) => arr.indexOf(n) === i).map((n) => (
            <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
              <div className="cat-pick-label">{n === passages.length ? `Tümü (${n} parça)` : `${n} parça`}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "score") {
    return (
      <div className="screen">
        <header className="screen-head"><h1>Cloze Test</h1></header>
        <div className="card score-card">
          <div className="score-big">%{round.total ? Math.round((round.firstTryCorrect / round.total) * 100) : 0}</div>
          <p className="muted small" style={{ margin: "-12px 0 16px" }}>tur puanı (ilk denemede doğru oranı)</p>
          <div className="score-row"><span className="score-label">Boşluk sayısı</span><span className="score-val">{round.total}</span></div>
          <div className="score-row"><span className="score-label">İlk denemede doğru</span><span className="score-val good">{round.firstTryCorrect}</span></div>
          <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
        </div>
      </div>
    );
  }

  if (!round.current) return null;
  const q = round.current;
  const answered = picked !== null;
  const isCorrect = picked === q.answer;
  const blankMatch = q.text.match(/\((\d+)\)/);
  const blankNum = blankMatch ? blankMatch[1] : null;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <span style={{ fontWeight: 700, fontSize: 17 }}>Cloze Test</span>
        <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
      </header>
      <p className="muted small" style={{ marginBottom: 10 }}>{q.groupLabel}</p>
      <div className="card question-card">
        <div className="passage">{blankNum ? highlightBlank(q.passage, blankNum) : q.passage}</div>
        <div className="q-text">{q.text}</div>
        <div className="options">
          {LETTERS.filter((l) => q.options[l]).map((l) => {
            let cls = "option";
            if (answered) {
              if (l === q.answer) cls += " correct";
              else if (l === picked) cls += " wrong";
            }
            return (
              <button key={l} className={cls} disabled={answered} onClick={() => choose(l)}>
                <span className="opt-letter">{l}</span>
                <span className="opt-text">{q.options[l]}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <>
            <div className={"feedback " + (isCorrect ? "good" : "bad")}>
              {isCorrect ? "✓ Doğru!" : `✗ Yanlış. Doğru cevap: ${q.answer}`}
            </div>
            {q.explanation && <div className="explain-text">{q.explanation}</div>}
            <button className="btn btn-primary btn-big" onClick={onNext}>Sonraki →</button>
          </>
        )}
      </div>
    </div>
  );
}
