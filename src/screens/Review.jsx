import { useState } from "react";
import { useStore } from "../store.js";
import { pickWeighted } from "../lib/sr.js";
import { getCategory, CAT_ORDER } from "../lib/categories.js";

const LETTERS = ["A", "B", "C", "D", "E"];

function getWrongCat(w, denemes) {
  const deneme = denemes.find((d) => d.id === w.denemeId);
  return getCategory(w.question.number, deneme?.type ?? "yokdil");
}

function pickFrom(cat, denemes) {
  const all = useStore.getState().wrongQuestions;
  const pool = cat
    ? all.filter((w) => getWrongCat(w, useStore.getState().denemes) === cat)
    : all;
  return pickWeighted(pool, (w) => w.stats) ?? null;
}

export default function Review() {
  const wrongQuestions = useStore((s) => s.wrongQuestions);
  const denemes = useStore((s) => s.denemes);
  const recordReview = useStore((s) => s.recordReview);

  const [catPicker, setCatPicker] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const [current, setCurrent] = useState(null);
  const [picked, setPicked] = useState(null);

  // Kategori sayıları
  const catCounts = {};
  wrongQuestions.forEach((w) => {
    const c = getWrongCat(w, denemes);
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const catEntries = CAT_ORDER.filter((c) => catCounts[c]).map((c) => ({ label: c, count: catCounts[c] }));

  const startReview = (cat) => {
    setSelectedCat(cat);
    setCatPicker(false);
    setPicked(null);
    setCurrent(pickFrom(cat, denemes));
  };

  const next = () => {
    setPicked(null);
    setCurrent(pickFrom(selectedCat, denemes));
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="screen">
        <header className="screen-head"><h1>Tekrar Çöz</h1></header>
        <div className="empty">
          <p>Tekrar çözülecek yanlış soru yok.</p>
          <p className="muted">Önce deneme çöz, yanlışların biriksin.</p>
        </div>
      </div>
    );
  }

  // ---- Kategori seçici ----
  if (catPicker) {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Tekrar Çöz</h1>
        </header>
        <p className="muted" style={{ marginBottom: 14 }}>Hangi bölümden çalışmak istersin?</p>
        <div className="list">
          <div className="card cat-pick-card" onClick={() => startReview(null)}>
            <div className="cat-pick-label">Mix — Tüm Yanlışlar</div>
            <div className="cat-pick-sub muted small">{wrongQuestions.length} soru</div>
          </div>
          {catEntries.map(({ label, count }) => (
            <div key={label} className="card cat-pick-card" onClick={() => startReview(label)}>
              <div className="cat-pick-label">{label}</div>
              <div className="cat-pick-sub muted small">{count} soru</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setCatPicker(true)}>← {selectedCat ?? "Mix"}</button>
        </header>
        <div className="empty"><p>Bu kategoride soru yok.</p></div>
      </div>
    );
  }

  const q = current.question;
  const answered = picked !== null;
  const isCorrect = picked === q.answer;
  const denemeName = denemes.find((d) => d.id === current.denemeId)?.name ?? current.denemeName;

  const choose = (letter) => {
    if (answered) return;
    setPicked(letter);
    recordReview(current.id, letter === q.answer);
  };

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setCatPicker(true)}>
          ← {selectedCat ?? "Mix"}
        </button>
        <span className="muted small">{catCounts[selectedCat] ?? wrongQuestions.length} soru</span>
      </header>

      <div className="card question-card">
        <span className="muted small">
          {denemeName} · Soru {q.number} · görülme: {current.stats.seen} · doğru: {current.stats.correct}
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
