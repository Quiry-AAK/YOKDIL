import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";
import { getCategory, CAT_ORDER } from "../lib/categories.js";

const LETTERS = ["A", "B", "C", "D", "E"];

const EXAM_TYPES = [
  { key: null, label: "Mix — Tüm Yanlışlar" },
  { key: "yokdil", label: "YÖKDİL Yanlışları" },
  { key: "yds", label: "YDS Yanlışları" },
];

function getWrongType(w, denemes) {
  return denemes.find((d) => d.id === w.denemeId)?.type ?? "yokdil";
}

function getWrongCat(w, denemes) {
  return getCategory(w.question.number, getWrongType(w, denemes));
}

export default function Review() {
  const wrongQuestions = useStore((s) => s.wrongQuestions);
  const denemes = useStore((s) => s.denemes);
  const recordReview = useStore((s) => s.recordReview);

  const [stage, setStage] = useState("examtype"); // examtype | category | size | play | score
  const [examType, setExamType] = useState(null); // null = mix
  const [selectedCat, setSelectedCat] = useState(null);
  const round = useRound();
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    setPicked(null);
  }, [round.current]);

  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const examPool = (et) =>
    et ? wrongQuestions.filter((w) => getWrongType(w, denemes) === et) : wrongQuestions;

  // Kategori sayıları (seçili sınav türüne göre)
  const catCounts = {};
  examPool(examType).forEach((w) => {
    const c = getWrongCat(w, denemes);
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const catEntries = CAT_ORDER.filter((c) => catCounts[c]).map((c) => ({ label: c, count: catCounts[c] }));

  const poolFor = (cat) => {
    const base = examPool(examType);
    return cat ? base.filter((w) => getWrongCat(w, denemes) === cat) : base;
  };

  const startExamType = (et) => {
    setExamType(et);
    setStage("category");
  };

  const startCategory = (cat) => {
    setSelectedCat(cat);
    setStage("size");
  };

  const startRound = (n) => {
    const pool = pickLeastSeen(poolFor(selectedCat), (w) => w.stats, n);
    round.start(pool, (w) => w.id);
    setStage("play");
  };

  const choose = (letter) => {
    if (picked) return;
    setPicked(letter);
    const isCorrect = letter === round.current.question.answer;
    recordReview(round.current.id, isCorrect);
  };

  const onNext = () => {
    const isCorrect = picked === round.current.question.answer;
    round.answer(isCorrect);
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

  // ---- Sınav türü seçici ----
  if (stage === "examtype") {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Tekrar Çöz</h1>
        </header>
        <p className="muted" style={{ marginBottom: 14 }}>Hangi sınav türünden çalışmak istersin?</p>
        <div className="list">
          {EXAM_TYPES.map((et) => {
            const count = examPool(et.key).length;
            return (
              <div
                key={et.label}
                className={"card cat-pick-card" + (count === 0 ? " disabled" : "")}
                onClick={() => count > 0 && startExamType(et.key)}
              >
                <div className="cat-pick-label">{et.label}</div>
                <div className="cat-pick-sub muted small">{count} soru</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const examLabel = EXAM_TYPES.find((et) => et.key === examType)?.label ?? "Mix";

  // ---- Kategori seçici ----
  if (stage === "category") {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("examtype")}>← {examLabel}</button>
        </header>
        <p className="muted" style={{ marginBottom: 14 }}>Hangi bölümden çalışmak istersin?</p>
        <div className="list">
          <div className="card cat-pick-card" onClick={() => startCategory(null)}>
            <div className="cat-pick-label">Mix — Tüm Yanlışlar</div>
            <div className="cat-pick-sub muted small">{examPool(examType).length} soru</div>
          </div>
          {catEntries.map(({ label, count }) => (
            <div key={label} className="card cat-pick-card" onClick={() => startCategory(label)}>
              <div className="cat-pick-label">{label}</div>
              <div className="cat-pick-sub muted small">{count} soru</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Tur boyutu seçici ----
  if (stage === "size") {
    const poolLen = poolFor(selectedCat).length;
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("category")}>← {selectedCat ?? "Mix"}</button>
        </header>
        <p className="muted" style={{ marginBottom: 12 }}>Kaç soru çalışmak istiyorsun? En az görülenler önce gelir.</p>
        <div className="list">
          {roundSizeChoices(poolLen).map((n) => (
            <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
              <div className="cat-pick-label">{n === poolLen ? `Tümü (${n})` : `${n} soru`}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Tur puanı ----
  if (stage === "score") {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("category")}>← {selectedCat ?? "Mix"}</button>
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

  // ---- Soru ekranı ----
  if (!round.current) {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("category")}>← {selectedCat ?? "Mix"}</button>
        </header>
        <div className="empty"><p>Bu kategoride soru yok.</p></div>
      </div>
    );
  }

  const live = wrongQuestions.find((w) => w.id === round.current.id) ?? round.current;
  const q = live.question;
  const answered = picked !== null;
  const isCorrect = picked === q.answer;
  const denemeName = denemes.find((d) => d.id === live.denemeId)?.name ?? live.denemeName;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setStage("category")}>
          ← {selectedCat ?? "Mix"}
        </button>
        <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
      </header>

      <div className="card question-card">
        <span className="muted small">
          {denemeName} · Soru {q.number} · görülme: {live.stats.seen} · doğru: {live.stats.correct}
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
            {live.explanation && (
              <div className="explain-text">{live.explanation}</div>
            )}
            <button className="btn btn-primary btn-big" onClick={onNext}>
              Sonraki Soru →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
