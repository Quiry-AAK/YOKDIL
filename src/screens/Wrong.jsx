import { useState, useRef } from "react";
import { useStore } from "../store.js";
import { explainQuestion } from "../lib/ai.js";
import { getCategory, CAT_ORDER } from "../lib/categories.js";

const LETTERS = ["A", "B", "C", "D", "E"];

function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function WrongCard({ w }) {
  const settings = useStore((s) => s.settings);
  const setExplanation = useStore((s) => s.setExplanation);
  const setWrongNote = useStore((s) => s.setWrongNote);
  const removeWrong = useStore((s) => s.removeWrong);
  const currentDenemeName = useStore(
    (s) => s.denemes.find((d) => d.id === w.denemeId)?.name ?? w.denemeName
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noteDraft, setNoteDraft] = useState(w.note || "");
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
        <span className="muted small">
          {currentDenemeName}{q.number ? ` · Soru ${q.number}` : ""}
          {w.note && <span title="Not var"> 📝</span>}
        </span>
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
          <div className="note-block">
            <p className="muted small" style={{ margin: "0 0 6px" }}>Neden yanlış yaptın? (notun)</p>
            <textarea
              className="input note-input"
              placeholder="ör. gerund/infinitive karıştırdım, cümleyi yanlış anladım…"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onBlur={() => { if (noteDraft !== (w.note || "")) setWrongNote(w.id, noteDraft); }}
              rows={2}
            />
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
  const syncWrongFromDenemes = useStore((s) => s.syncWrongFromDenemes);
  const importRef = useRef();
  const [importMsg, setImportMsg] = useState(null);
  const [syncMsg, setSyncMsg] = useState(null);
  const [openCats, setOpenCats] = useState(new Set());

  const onSync = () => {
    const n = syncWrongFromDenemes();
    setSyncMsg(n > 0 ? `${n} yanlış soru denemelerden çekildi.` : "Eksik yanlış bulunamadı, hepsi zaten listede.");
    setTimeout(() => setSyncMsg(null), 3000);
  };

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
    const cat = w.category || getCategory(w.question.number, type);
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

      <div className="io-row">
        <button className="btn btn-sm" onClick={onSync}>🔄 Denemelerden Yanlışları Çek</button>
      </div>
      {syncMsg && <div className="alert alert-ok">{syncMsg}</div>}

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
