import { useState } from "react";
import { useStore } from "../store.js";
import MarkableText from "../components/MarkableText.jsx";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function Solve({ denemeId, navigate }) {
  const deneme = useStore((s) => s.denemes.find((d) => d.id === denemeId));
  const answerQuestion = useStore((s) => s.answerQuestion);
  const [idx, setIdx] = useState(() => {
    if (!deneme) return 0;
    const firstUnanswered = deneme.questions.findIndex((q) => !q.userAnswer);
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });

  if (!deneme) {
    return (
      <div className="screen">
        <p>Deneme bulunamadı.</p>
        <button className="btn" onClick={() => navigate("home")}>← Geri</button>
      </div>
    );
  }

  const q = deneme.questions[idx];
  const answered = !!q.userAnswer;
  const isCorrect = q.userAnswer === q.answer;

  const choose = (letter) => {
    if (answered) return;
    answerQuestion(deneme.id, q.id, letter);
  };

  const go = (delta) => {
    const next = idx + delta;
    if (next >= 0 && next < deneme.questions.length) setIdx(next);
  };

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => navigate("home")}>← {deneme.name}</button>
        <span className="counter">
          Soru {idx + 1} / {deneme.questions.length}
        </span>
      </header>

      <p className="hint-bar">
        💡 Cevap için baştaki <b>harfe (A/B/C…)</b> dokun · İngilizce <b>kelimeye</b>{" "}
        dokununca Kelimeler oyununa eklenir.
      </p>

      <div className="card question-card">
        {q.passage && (
          <div className="passage">
            <MarkableText text={q.passage} />
          </div>
        )}

        <div className="q-text">
          <span className="q-num">{q.number}.</span>{" "}
          <MarkableText text={q.text} />
        </div>

        <div className="options">
          {LETTERS.filter((l) => q.options[l]).map((l) => {
            let cls = "option";
            if (answered) {
              if (l === q.answer) cls += " correct";
              else if (l === q.userAnswer) cls += " wrong";
            }
            return (
              <div key={l} className={cls}>
                <button
                  className="opt-letter"
                  onClick={() => choose(l)}
                  disabled={answered}
                  title="Bu şıkkı seç"
                >
                  {l}
                </button>
                <span className="opt-text">
                  <MarkableText text={q.options[l]} />
                </span>
              </div>
            );
          })}
        </div>

        {answered && (
          <div className={"feedback " + (isCorrect ? "good" : "bad")}>
            {isCorrect ? "✓ Doğru!" : `✗ Yanlış. Doğru cevap: ${q.answer}`}
            {!isCorrect && (
              <span className="muted"> — Yanlışlarım panelinde açıklamayı görebilirsin.</span>
            )}
          </div>
        )}
      </div>

      <div className="nav-row">
        <button className="btn" disabled={idx === 0} onClick={() => go(-1)}>
          ← Önceki
        </button>
        {idx < deneme.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => go(1)}>
            Sonraki →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate("home")}>
            Bitir
          </button>
        )}
      </div>
    </div>
  );
}
