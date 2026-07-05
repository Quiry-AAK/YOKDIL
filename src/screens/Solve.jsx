import { useState, useEffect, useRef } from "react";
import { useStore } from "../store.js";
import MarkableText from "../components/MarkableText.jsx";

const LETTERS = ["A", "B", "C", "D", "E"];
const FULL_EXAM_SECONDS = 180 * 60; // YÖKDİL/YDS: 80 soru / 180 dakika

function formatClock(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatElapsed(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} saniye`;
  return `${m} dakika ${s} saniye`;
}

export default function Solve({ denemeId, navigate }) {
  const deneme = useStore((s) => s.denemes.find((d) => d.id === denemeId));
  const answerQuestion = useStore((s) => s.answerQuestion);

  const totalSeconds = deneme ? Math.round(FULL_EXAM_SECONDS * (deneme.questions.length / 80)) : 0;

  const [idx, setIdx] = useState(() => {
    if (!deneme) return 0;
    const first = deneme.questions.findIndex((q) => !q.userAnswer);
    return first === -1 ? 0 : first;
  });
  const [showScore, setShowScore] = useState(false);
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!deneme) return;
    setRemaining(totalSeconds);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deneme?.id]);

  if (!deneme) {
    return (
      <div className="screen">
        <p>Deneme bulunamadı.</p>
        <button className="btn" onClick={() => navigate("home")}>← Geri</button>
      </div>
    );
  }

  const questions = deneme.questions;
  const q = questions[idx];
  const answered = !!q.userAnswer;
  const isCorrect = q.userAnswer === q.answer;
  const elapsed = totalSeconds - remaining;

  const choose = (letter) => {
    if (answered) return;
    answerQuestion(deneme.id, q.id, letter);
  };

  const go = (delta) => {
    const next = idx + delta;
    if (next >= 0 && next < questions.length) setIdx(next);
  };

  const onBitir = () => {
    const fresh = useStore.getState().denemes.find((d) => d.id === denemeId);
    const allDone = fresh?.questions.every((x) => x.userAnswer);
    if (allDone) {
      clearInterval(intervalRef.current);
      setShowScore(true);
    } else {
      navigate("home");
    }
  };

  // ---- Skor ekranı ----
  if (showScore) {
    const fresh = useStore.getState().denemes.find((d) => d.id === denemeId);
    const qs = fresh?.questions || [];
    const total = qs.length;
    const correct = qs.filter((x) => x.userAnswer === x.answer).length;
    const wrong = qs.filter((x) => x.userAnswer && x.userAnswer !== x.answer).length;
    const unanswered = qs.filter((x) => !x.userAnswer).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Sonuç</h1>
          <p className="muted">{deneme.name}</p>
        </header>
        <div className="card score-card">
          <div className="score-big">{(correct * 1.25).toFixed(2)}</div>
          <p className="muted small" style={{ margin: "-12px 0 16px" }}>puan (doğru × 1,25)</p>
          <div className="score-row"><span className="score-label">Doğru</span><span className="score-val good">{correct}</span></div>
          <div className="score-row"><span className="score-label">Yanlış</span><span className="score-val bad">{wrong}</span></div>
          {unanswered > 0 && <div className="score-row"><span className="score-label">Boş</span><span className="score-val muted">{unanswered}</span></div>}
          <div className="score-row"><span className="score-label">Toplam</span><span className="score-val">{total}</span></div>
          <div className="score-row"><span className="score-label">Yüzde</span><span className="score-val">%{pct}</span></div>
          <div className="score-row"><span className="score-label">Süre</span><span className="score-val">{formatElapsed(elapsed)}</span></div>
        </div>
        <div className="nav-row">
          <button className="btn" onClick={() => { setShowScore(false); setIdx(0); }}>Tekrar İncele</button>
          <button className="btn btn-primary" onClick={() => navigate("home")}>Ana Sayfa</button>
        </div>
      </div>
    );
  }

  // ---- Soru ekranı ----
  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => navigate("home")}>
          ← {deneme.name}
        </button>
        <span className={"counter timer-badge" + (remaining <= 300 ? " timer-low" : "")}>⏱ {formatClock(remaining)}</span>
      </header>
      <p className="muted small" style={{ marginTop: -12, marginBottom: 12 }}>Soru {idx + 1} / {questions.length}</p>

      <p className="hint-bar">
        💡 Cevap için <b>harfe (A/B/C…)</b> dokun · İngilizce <b>kelimeye</b> dokunca bekleme listesine eklenir.
      </p>

      <div className="card question-card">
        {q.passage && (
          <div className="passage"><MarkableText text={q.passage} /></div>
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
                <button className="opt-letter" onClick={() => choose(l)} disabled={answered} title="Bu şıkkı seç">{l}</button>
                <span className="opt-text"><MarkableText text={q.options[l]} /></span>
              </div>
            );
          })}
        </div>
        {answered && (
          <div className={"feedback " + (isCorrect ? "good" : "bad")}>
            {isCorrect ? "✓ Doğru!" : `✗ Yanlış. Doğru cevap: ${q.answer}`}
            {!isCorrect && <span className="muted"> — Yanlışlarım panelinde açıklamayı görebilirsin.</span>}
          </div>
        )}
      </div>

      <div className="nav-row">
        <button className="btn" disabled={idx === 0} onClick={() => go(-1)}>← Önceki</button>
        {idx < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => go(1)}>Sonraki →</button>
        ) : (
          <button className="btn btn-primary" onClick={onBitir}>Bitir</button>
        )}
      </div>
    </div>
  );
}
