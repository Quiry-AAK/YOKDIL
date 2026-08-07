import { useState, useEffect, useRef } from "react";
import { useStore } from "../store.js";
import MarkableText from "../components/MarkableText.jsx";
import { getCategory, CAT_ORDER } from "../lib/categories.js";

const LETTERS = ["A", "B", "C", "D", "E"];
const FULL_EXAM_SECONDS = 180 * 60; // YÖKDİL/YDS: 80 soru / 180 dakika
const FLUSH_EVERY = 5; // saniyede bir store'a kalıcı olarak yaz

function formatClock(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatElapsed(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m === 0) return `${s} saniye`;
  return `${m} dakika ${s} saniye`;
}

export default function Solve({ denemeId, navigate, startInReport }) {
  const deneme = useStore((s) => s.denemes.find((d) => d.id === denemeId));
  const answerQuestion = useStore((s) => s.answerQuestion);
  const addDenemeTime = useStore((s) => s.addDenemeTime);
  const addQuestionTime = useStore((s) => s.addQuestionTime);
  const retakeDeneme = useStore((s) => s.retakeDeneme);
  const undoRetake = useStore((s) => s.undoRetake);

  const totalSeconds = deneme ? Math.round(FULL_EXAM_SECONDS * (deneme.questions.length / 80)) : 0;
  const persistedElapsed = deneme?.timeSpent || 0;

  const [idx, setIdx] = useState(() => {
    if (!deneme) return 0;
    const first = deneme.questions.findIndex((q) => !q.userAnswer);
    return first === -1 ? 0 : first;
  });
  const [showScore, setShowScore] = useState(!!startInReport);
  const [remaining, setRemaining] = useState(Math.max(0, totalSeconds - persistedElapsed));
  const [qElapsed, setQElapsed] = useState(() => deneme?.questions[idx]?.timeSpent || 0);
  const [showNav, setShowNav] = useState(false);
  const [eliminatedByQ, setEliminatedByQ] = useState({});

  const pendingDenemeRef = useRef(0);
  const pendingQuestionRef = useRef(0);
  const intervalIdRef = useRef(null);

  const flush = (qId) => {
    if (!deneme) return;
    if (pendingDenemeRef.current > 0) {
      addDenemeTime(deneme.id, pendingDenemeRef.current);
      pendingDenemeRef.current = 0;
    }
    if (pendingQuestionRef.current > 0 && qId) {
      addQuestionTime(deneme.id, qId, pendingQuestionRef.current);
      pendingQuestionRef.current = 0;
    }
  };

  // Soru değişince küçük soru zamanlayıcısı o sorunun daha önce biriken
  // süresinden devam eder (0'a sıfırlanmaz)
  useEffect(() => {
    setQElapsed(deneme?.questions[idx]?.timeSpent || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Ana geri sayım — sadece ekran aktifken (görünürken) ve rapor ekranında değilken çalışır, kalıcı olarak birikir
  useEffect(() => {
    if (!deneme || showScore) return;
    const currentQId = deneme.questions[idx]?.id;
    let id = null;

    const tick = () => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
      setQElapsed((e) => e + 1);
      pendingDenemeRef.current += 1;
      pendingQuestionRef.current += 1;
      if (pendingDenemeRef.current >= FLUSH_EVERY) flush(currentQId);
    };
    const start = () => {
      if (!id) id = setInterval(tick, 1000);
      intervalIdRef.current = id;
    };
    const stop = () => {
      if (id) { clearInterval(id); id = null; }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      flush(currentQId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deneme?.id, idx, showScore]);

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
  const eliminatedSet = new Set(eliminatedByQ[q.id] || []);

  const choose = (letter) => {
    if (answered) return;
    answerQuestion(deneme.id, q.id, letter);
  };

  const toggleEliminate = (letter) => {
    setEliminatedByQ((prev) => {
      const cur = new Set(prev[q.id] || []);
      if (cur.has(letter)) cur.delete(letter);
      else cur.add(letter);
      return { ...prev, [q.id]: [...cur] };
    });
  };

  const go = (delta) => {
    const next = idx + delta;
    if (next >= 0 && next < questions.length) setIdx(next);
  };

  const onBitir = () => {
    const fresh = useStore.getState().denemes.find((d) => d.id === denemeId);
    const allDone = fresh?.questions.every((x) => x.userAnswer);
    if (allDone) {
      clearInterval(intervalIdRef.current);
      flush(q.id);
      setShowScore(true);
    } else {
      navigate("home");
    }
  };

  // ---- Skor / süre raporu ekranı ----
  if (showScore) {
    const fresh = useStore.getState().denemes.find((d) => d.id === denemeId);
    const qs = fresh?.questions || [];
    const total = qs.length;
    const correct = qs.filter((x) => x.userAnswer === x.answer).length;
    const wrong = qs.filter((x) => x.userAnswer && x.userAnswer !== x.answer).length;
    const unanswered = qs.filter((x) => !x.userAnswer).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;

    // Eski denemelerde soru bazlı süre kaydı yok — kırık/sıfır görünmesin diye
    // standart sınav temposuna (180dk/80soru) göre orantılı süre varsayılır.
    const hasTimerData = !!fresh?.timeSpent;
    const perQFallback = total ? totalSeconds / total : 0;
    const totalSpentDisplay = hasTimerData ? fresh.timeSpent : totalSeconds;

    const catTime = {};
    qs.forEach((x) => {
      const cat = getCategory(x.number, fresh.type);
      const t = hasTimerData ? (x.timeSpent || 0) : perQFallback;
      if (!catTime[cat]) catTime[cat] = { totalSec: 0, count: 0 };
      catTime[cat].totalSec += t;
      catTime[cat].count += 1;
    });
    const catReport = CAT_ORDER.filter((c) => catTime[c]).map((c) => ({
      label: c,
      avgSec: catTime[c].totalSec / catTime[c].count,
    }));

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
          <div className="score-row"><span className="score-label">Süre</span><span className="score-val">{formatElapsed(totalSpentDisplay)}</span></div>
        </div>

        {catReport.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Soru Tipi Bazında Süre</h3>
            {catReport.map(({ label, avgSec }) => (
              <div key={label} className="score-row">
                <span className="score-label">{label}</span>
                <span className="score-val">{formatElapsed(avgSec)} / soru</span>
              </div>
            ))}
          </div>
        )}

        {fresh?.pastAttempts?.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Geçmiş Denemeler</h3>
            {[...fresh.pastAttempts].reverse().map((a, i) => (
              <div key={a.date} className="score-row">
                <span className="score-label">
                  {new Date(a.date).toLocaleDateString("tr-TR")}
                </span>
                <span className="score-val">
                  {a.score} puan · <span style={{ color: "var(--good)" }}>✓{a.correct}</span> <span style={{ color: "var(--bad)" }}>✗{a.wrong}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="nav-row">
          <button className="btn" onClick={() => { setShowScore(false); setIdx(0); }}>Tekrar İncele</button>
          <button className="btn btn-primary" onClick={() => navigate("home")}>Ana Sayfa</button>
        </div>
        <div className="nav-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (confirm("Bu deneme yeniden çözülsün mü? Şu anki puan geçmişe kaydedilir, cevapların sıfırlanır.")) {
                retakeDeneme(deneme.id);
                setRemaining(totalSeconds);
                setQElapsed(0);
                setIdx(0);
                setShowScore(false);
              }
            }}
          >
            🔁 Yeniden Çöz
          </button>
        </div>
        {fresh?.lastAttemptSnapshot && (
          <div className="nav-row">
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (confirm("Yeniden çözme iptal edilsin mi? Eski cevapların ve puanın geri gelir.")) {
                  undoRetake(deneme.id);
                }
              }}
            >
              ↩️ Yeniden Çözmeyi İptal Et
            </button>
          </div>
        )}
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
      <div className="solve-sub-row">
        <button className="qnav-trigger" onClick={() => setShowNav(true)}>Soru {idx + 1} / {questions.length} ▾</button>
        <span className="q-timer">🕐 {formatClock(qElapsed)}</span>
      </div>

      <p className="hint-bar">
        💡 Cevap için <b>harfe (A/B/C…)</b> dokun · İngilizce <b>kelimeye</b> dokunca bekleme listesine eklenir.
      </p>

      <div className="card question-card">
        {q.passage && (
          <div className="passage"><MarkableText text={q.passage} sourceType={deneme.type} /></div>
        )}
        <div className="q-text">
          <span className="q-num">{q.number}.</span>{" "}
          <MarkableText text={q.text} sourceType={deneme.type} />
        </div>
        <div className="options">
          {LETTERS.filter((l) => q.options[l]).map((l) => {
            let cls = "option with-eliminate";
            if (answered) {
              if (l === q.answer) cls += " correct";
              else if (l === q.userAnswer) cls += " wrong";
            }
            if (eliminatedSet.has(l)) cls += " eliminated";
            return (
              <div key={l} className={cls}>
                <div className="opt-row">
                  <button className="opt-letter" onClick={() => choose(l)} disabled={answered} title="Bu şıkkı seç">{l}</button>
                  <span className="opt-text"><MarkableText text={q.options[l]} sourceType={deneme.type} /></span>
                </div>
                {!answered && (
                  <button className="opt-eliminate-btn" onClick={() => toggleEliminate(l)}>
                    {eliminatedSet.has(l) ? "↺ Geri al" : "✕ Bu şıkkı ele"}
                  </button>
                )}
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

      {showNav && (
        <div className="drawer-overlay qnav-overlay" onClick={() => setShowNav(false)}>
          <div className="qnav-panel" onClick={(e) => e.stopPropagation()}>
            <div className="qnav-head">
              <span>Soruya Git</span>
              <button className="icon-btn" onClick={() => setShowNav(false)}>✕</button>
            </div>
            <div className="qnav-grid">
              {questions.map((qq, i) => {
                let cls = "qnav-cell";
                if (i === idx) cls += " current";
                if (qq.userAnswer) cls += qq.userAnswer === qq.answer ? " correct" : " wrong";
                return (
                  <button key={qq.id} className={cls} onClick={() => { setIdx(i); setShowNav(false); }}>
                    {qq.number}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
