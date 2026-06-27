import { useState, useMemo } from "react";
import { useStore } from "../store.js";
import MarkableText from "../components/MarkableText.jsx";

const LETTERS = ["A", "B", "C", "D", "E"];

const YOKDIL_CATS = [
  { label: "Kelime Bilgisi", min: 1, max: 6 },
  { label: "Dil Bilgisi", min: 7, max: 20 },
  { label: "Cloze Test", min: 21, max: 30 },
  { label: "Cümle Tamamlama", min: 31, max: 41 },
  { label: "İng→Türkçe Çeviri", min: 42, max: 47 },
  { label: "Türkçe→İng Çeviri", min: 48, max: 53 },
  { label: "Paragraf Tamamlama", min: 54, max: 59 },
  { label: "Anlam Bütünlüğü", min: 60, max: 65 },
  { label: "Okuduğunu Anlama", min: 66, max: 80 },
];

const YDS_CATS = [
  { label: "Kelime Bilgisi", min: 1, max: 6 },
  { label: "Dil Bilgisi", min: 7, max: 16 },
  { label: "Cloze Test", min: 17, max: 26 },
  { label: "Cümle Tamamlama", min: 27, max: 36 },
  { label: "Çeviri", min: 37, max: 42 },
  { label: "Okuma Parçaları", min: 43, max: 62 },
  { label: "Diyalog Tamamlama", min: 63, max: 67 },
  { label: "Anlamca En Yakın Cümle", min: 68, max: 71 },
  { label: "Paragraf Tamamlama", min: 72, max: 75 },
  { label: "Anlam Bütünlüğü", min: 76, max: 80 },
];

const CAT_ORDER = [
  "Kelime Bilgisi", "Dil Bilgisi", "Cloze Test", "Cümle Tamamlama",
  "İng→Türkçe Çeviri", "Türkçe→İng Çeviri", "Çeviri",
  "Paragraf Tamamlama", "Anlam Bütünlüğü",
  "Okuduğunu Anlama", "Okuma Parçaları",
  "Diyalog Tamamlama", "Anlamca En Yakın Cümle", "Diğer",
];

function getCategory(num, type) {
  const cats = type === "yds" ? YDS_CATS : YOKDIL_CATS;
  return cats.find((c) => num >= c.min && num <= c.max)?.label ?? "Diğer";
}

export default function Solve({ denemeId, navigate }) {
  const deneme = useStore((s) => s.denemes.find((d) => d.id === denemeId));
  const answerQuestion = useStore((s) => s.answerQuestion);

  const [catPicker, setCatPicker] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null); // null = Mix (tümü)
  const [idx, setIdx] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const catEntries = useMemo(() => {
    if (!deneme) return [];
    const counts = {};
    deneme.questions.forEach((q) => {
      const c = getCategory(q.number, deneme.type);
      counts[c] = (counts[c] || 0) + 1;
    });
    return CAT_ORDER.filter((c) => counts[c]).map((c) => ({ label: c, count: counts[c] }));
  }, [deneme?.id, deneme?.type]);

  const questions = useMemo(() => {
    if (!deneme) return [];
    if (!selectedCat) return deneme.questions;
    return deneme.questions.filter((q) => getCategory(q.number, deneme.type) === selectedCat);
  }, [deneme, selectedCat]);

  if (!deneme) {
    return (
      <div className="screen">
        <p>Deneme bulunamadı.</p>
        <button className="btn" onClick={() => navigate("home")}>← Geri</button>
      </div>
    );
  }

  // ---- Kategori seçici ----
  if (catPicker) {
    return (
      <div className="screen">
        <header className="screen-head">
          <button className="link" onClick={() => navigate("home")}>← {deneme.name}</button>
        </header>
        <p className="muted" style={{ marginBottom: 14 }}>Hangi bölümden çözmek istersin?</p>
        <div className="list">
          <div
            className="card cat-pick-card"
            onClick={() => {
              setSelectedCat(null);
              const first = deneme.questions.findIndex((q) => !q.userAnswer);
              setIdx(first === -1 ? 0 : first);
              setCatPicker(false);
            }}
          >
            <div className="cat-pick-label">Mix — Tüm Sorular</div>
            <div className="cat-pick-sub muted small">
              {deneme.questions.length} soru · {deneme.questions.filter((q) => q.userAnswer).length} cevaplandı
            </div>
          </div>
          {catEntries.map(({ label, count }) => {
            const qs = deneme.questions.filter((q) => getCategory(q.number, deneme.type) === label);
            const answered = qs.filter((q) => q.userAnswer).length;
            return (
              <div
                key={label}
                className="card cat-pick-card"
                onClick={() => {
                  setSelectedCat(label);
                  const first = qs.findIndex((q) => !q.userAnswer);
                  setIdx(first === -1 ? 0 : first);
                  setCatPicker(false);
                }}
              >
                <div className="cat-pick-label">{label}</div>
                <div className="cat-pick-sub muted small">{count} soru · {answered} cevaplandı</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const answered = !!q.userAnswer;
  const isCorrect = q.userAnswer === q.answer;

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
    const freshQs = selectedCat
      ? fresh?.questions.filter((x) => getCategory(x.number, fresh.type) === selectedCat)
      : fresh?.questions;
    const allDone = freshQs?.every((x) => x.userAnswer);
    if (allDone) setShowScore(true);
    else navigate("home");
  };

  // ---- Skor ekranı ----
  if (showScore) {
    const fresh = useStore.getState().denemes.find((d) => d.id === denemeId);
    const qs = selectedCat
      ? (fresh?.questions.filter((x) => getCategory(x.number, fresh.type) === selectedCat) || [])
      : (fresh?.questions || []);
    const total = qs.length;
    const correct = qs.filter((x) => x.userAnswer === x.answer).length;
    const wrong = qs.filter((x) => x.userAnswer && x.userAnswer !== x.answer).length;
    const unanswered = qs.filter((x) => !x.userAnswer).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Sonuç</h1>
          <p className="muted">{deneme.name}{selectedCat ? ` · ${selectedCat}` : ""}</p>
        </header>
        <div className="card score-card">
          <div className="score-big">{pct}<span className="score-pct">%</span></div>
          <div className="score-row"><span className="score-label">Doğru</span><span className="score-val good">{correct}</span></div>
          <div className="score-row"><span className="score-label">Yanlış</span><span className="score-val bad">{wrong}</span></div>
          {unanswered > 0 && <div className="score-row"><span className="score-label">Boş</span><span className="score-val muted">{unanswered}</span></div>}
          <div className="score-row"><span className="score-label">Toplam</span><span className="score-val">{total}</span></div>
        </div>
        <div className="nav-row">
          <button className="btn" onClick={() => { setShowScore(false); setIdx(0); }}>Tekrar İncele</button>
          <button className="btn btn-primary" onClick={() => { setShowScore(false); setCatPicker(true); }}>Bölüm Seç</button>
        </div>
        <div className="nav-row" style={{ marginTop: 0 }}>
          <button className="btn btn-primary btn-big" onClick={() => navigate("home")}>Ana Sayfa</button>
        </div>
      </div>
    );
  }

  // ---- Soru ekranı ----
  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setCatPicker(true)}>
          ← {selectedCat ?? deneme.name}
        </button>
        <span className="counter">Soru {idx + 1} / {questions.length}</span>
      </header>

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
