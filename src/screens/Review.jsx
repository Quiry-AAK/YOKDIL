import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { pickWeighted } from "../lib/sr.js";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function Review() {
  const wrongQuestions = useStore((s) => s.wrongQuestions);
  const recordReview = useStore((s) => s.recordReview);
  const [current, setCurrent] = useState(null);
  const [picked, setPicked] = useState(null);

  const next = () => {
    setPicked(null);
    const item = pickWeighted(useStore.getState().wrongQuestions, (w) => w.stats);
    setCurrent(item);
  };

  useEffect(() => {
    if (!current && wrongQuestions.length) next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrongQuestions.length]);

  if (wrongQuestions.length === 0) {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Yanlışları Tekrar Çöz</h1>
        </header>
        <div className="empty">
          <p>Tekrar çözülecek yanlış soru yok.</p>
          <p className="muted">Önce deneme çöz, yanlışların biriksin.</p>
        </div>
      </div>
    );
  }

  if (!current) return <div className="screen"><p>Yükleniyor…</p></div>;

  const q = current.question;
  const answered = picked !== null;
  const isCorrect = picked === q.answer;

  const choose = (letter) => {
    if (answered) return;
    setPicked(letter);
    recordReview(current.id, letter === q.answer);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Tekrar Çöz</h1>
        <p className="muted">
          Çok görüp doğru yaptıkların daha seyrek, takıldıkların daha sık gelir.
        </p>
      </header>

      <div className="card question-card">
        <span className="muted small">
          {current.denemeName} · Soru {q.number} · (görülme: {current.stats.seen}, doğru: {current.stats.correct})
        </span>
        {q.passage && <div className="passage">{q.passage}</div>}
        <div className="q-text">
          <span className="q-num">{q.number}.</span> {q.text}
        </div>

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
            {current.explanation && (
              <div className="explain-text">{current.explanation}</div>
            )}
            <button className="btn btn-primary btn-big" onClick={next}>
              Sonraki Soru →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
