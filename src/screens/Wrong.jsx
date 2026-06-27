import { useState, useRef } from "react";
import { useStore } from "../store.js";
import { explainQuestion } from "../lib/ai.js";

const LETTERS = ["A", "B", "C", "D", "E"];

function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

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

function getCategory(questionNumber, denemeType) {
  const cats = denemeType === "yds" ? YDS_CATS : YOKDIL_CATS;
  return cats.find((c) => questionNumber >= c.min && questionNumber <= c.max)?.label ?? "Diğer";
}

function WrongCard({ w }) {
  const settings = useStore((s) => s.settings);
  const setExplanation = useStore((s) => s.setExplanation);
  const removeWrong = useStore((s) => s.removeWrong);
  const currentDenemeName = useStore(
    (s) => s.denemes.find((d) => d.id === w.denemeId)?.name ?? w.denemeName
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const q = w.question;

  const loadExplanation = async () => {
    setError(null); setLoading(true);
    try {
      const text = await explainQuestion({ apiKey: settings.apiKey, model: settings.model, question: q });
      setExplanation(w.id, text);
    } catch (e) {
      setError(e.message || "Açıklama alınamadı.");
    } finally { setLoading(false); }
  };

  return (
    <div className="card wrong-card">
      <div className="wrong-head" onClick={() => setOpen(!open)}>
        <span className="muted small">{currentDenemeName} · Soru {q.number}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>
      <div className="q-text small">{q.text}</div>
      {open && (
        <>
          {q.passage && (
            <div className="passage" style={{ fontSize: 13, marginBottom: 10 }}>
              {q.passage}
            </div>
          )}
          <div className="options compact">
            {LETTERS.filter((l) => q.options[l]).map((l) => {
              let cls = "option static";
              if (l === q.answer) cls += " correct";
              else if (l === q.userAnswer) cls += " wrong";
              return (
                <div key={l} className={cls}>
                  <span className="opt-letter">{l}</span>
                  <span className="opt-text">{q.options[l]}</span>
                </div>
              );
            })}
          </div>
          <div className="explain">
            {w.explanation ? (
              <div className="explain-text">{w.explanation}</div>
            ) : (
              <button className="btn btn-sm" disabled={loading} onClick={loadExplanation}>
                {loading ? "AI düşünüyor…" : "🧠 AI açıklaması iste"}
              </button>
            )}
            {error && <div className="alert">{error}</div>}
          </div>
          <button className="link danger" onClick={() => removeWrong(w.id)}>Bu soruyu listeden kaldır</button>
        </>
      )}
    </div>
  );
}

export default function Wrong() {
  const wrongQuestions = useStore((s) => s.wrongQuestions);
  const denemes = useStore((s) => s.denemes);
  const importWrongQuestions = useStore((s) => s.importWrongQuestions);
  const importRef = useRef();
  const [importMsg, setImportMsg] = useState(null);
  const [openCats, setOpenCats] = useState(new Set());

  const toggleCat = (cat) =>
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const onImport = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const arr = Array.isArray(data) ? data : data.wrongQuestions;
        const n = importWrongQuestions(arr);
        setImportMsg(`${n} yanlış soru eklendi.`);
        setTimeout(() => setImportMsg(null), 2500);
      } catch { setImportMsg("Geçersiz JSON."); setTimeout(() => setImportMsg(null), 2500); }
    };
    reader.readAsText(file);
  };

  // Soruları kategoriye göre grupla
  const grouped = {};
  wrongQuestions.forEach((w) => {
    const deneme = denemes.find((d) => d.id === w.denemeId);
    const type = deneme?.type ?? "yokdil";
    const cat = getCategory(w.question.number, type);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(w);
  });

  const catEntries = CAT_ORDER
    .filter((cat) => grouped[cat]?.length)
    .map((cat) => [cat, grouped[cat]]);

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Yanlışlarım</h1>
        <p className="muted">Yanlış yaptığın sorular burada.</p>
      </header>

      {wrongQuestions.length > 0 && (
        <div className="io-row">
          <button className="btn btn-sm" onClick={() => exportJSON(wrongQuestions, "yanlislar.json")}>Dışa Aktar</button>
          <button className="btn btn-sm" onClick={() => importRef.current?.click()}>İçe Aktar</button>
          <input ref={importRef} type="file" accept=".json" hidden onChange={onImport} />
        </div>
      )}
      {importMsg && <div className="alert alert-ok">{importMsg}</div>}

      {wrongQuestions.length === 0 ? (
        <div className="empty">
          <p>Henüz yanlışın yok. 👏</p>
          <p className="muted">Deneme çözdükçe yanlışların buraya düşer.</p>
        </div>
      ) : (
        <div className="list">
          {catEntries.map(([cat, items]) => (
            <div key={cat} className="cat-section">
              <button className="cat-head" onClick={() => toggleCat(cat)}>
                <span className="cat-label">{cat}</span>
                <span className="cat-count">{items.length}</span>
                <span className="cat-chevron">{openCats.has(cat) ? "▲" : "▼"}</span>
              </button>
              {openCats.has(cat) && (
                <div className="cat-items">
                  {items.map((w) => <WrongCard key={w.id} w={w} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
