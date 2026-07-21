import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { TOPICS } from "../lib/topics.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";

const LETTERS = ["A", "B", "C", "D", "E"];

// topics.js'teki hazır soru havuzlarını (Cümle Tamamlama, Anlam Bütünlüğü vb.)
// tur sistemiyle oynanabilir hâle getiren paylaşılan oyun ekranı.
export default function ExamGame({ topicKey, title, subtitle }) {
  const topic = TOPICS.find((t) => t.key === topicKey);
  const examStats = useStore((s) => s.examStats);
  const recordExamAnswer = useStore((s) => s.recordExamAnswer);

  const [stage, setStage] = useState("size"); // size | play | score
  const round = useRound();
  const [picked, setPicked] = useState(null);

  const items = topic.questions.map((q, i) => ({ ...q, __idx: i }));
  const statKey = (it) => `${topicKey}:${it.__idx}`;
  const statsOf = (it) => examStats[statKey(it)] || { seen: 0, correct: 0 };

  useEffect(() => { setPicked(null); }, [round.current]);
  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const startRound = (n) => {
    const pool = pickLeastSeen(items, statsOf, n);
    round.start(pool, statKey);
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
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </header>
        <p className="muted" style={{ marginBottom: 12 }}>Kaç soru çalışmak istiyorsun? En az görülenler önce gelir.</p>
        <div className="list">
          {roundSizeChoices(items.length).map((n) => (
            <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
              <div className="cat-pick-label">{n === items.length ? `Tümü (${n})` : `${n} soru`}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "score") {
    return (
      <div className="screen">
        <header className="screen-head"><h1>{title}</h1></header>
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

  if (!round.current) return null;
  const q = round.current;
  const answered = picked !== null;
  const isCorrect = picked === q.answer;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <span style={{ fontWeight: 700, fontSize: 17 }}>{title}</span>
        <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
      </header>
      <div className="card question-card">
        {q.passage && <div className="passage">{q.passage}</div>}
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
