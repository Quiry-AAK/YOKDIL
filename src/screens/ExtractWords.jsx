import { useState, useMemo } from "react";
import { useStore } from "../store.js";

function tokenSetFromDeneme(d) {
  const set = new Set();
  d.questions.forEach((q) => {
    [q.passage, q.text, ...Object.values(q.options || {})].forEach((t) => {
      if (!t) return;
      (t.match(/[A-Za-z']+/g) || []).forEach((w) => {
        set.add(w.replace(/^'+|'+$/g, "").toLowerCase());
      });
    });
  });
  return set;
}

export default function ExtractWords() {
  const denemes = useStore((s) => s.denemes);
  const words = useStore((s) => s.words);
  const extractWordsFromDenemes = useStore((s) => s.extractWordsFromDenemes);

  const [selected, setSelected] = useState(new Set());
  const [msg, setMsg] = useState(null);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const matchedWords = useMemo(() => {
    if (selected.size === 0) return [];
    const tokenSet = new Set();
    denemes
      .filter((d) => selected.has(d.id))
      .forEach((d) => {
        tokenSetFromDeneme(d).forEach((w) => tokenSet.add(w));
      });
    return words.filter((w) => tokenSet.has(w.word.toLowerCase()));
  }, [denemes, selected, words]);

  const onExtract = () => {
    const n = extractWordsFromDenemes([...selected]);
    setMsg(
      n > 0
        ? `${n} kelime "Denemelerden Çıkarılan Kelimeler" grubuna ayrıldı — kelime oyunlarından çalışabilirsin.`
        : "Seçtiğin denemelerde, kelimelerim listende olan bir kelime bulunamadı."
    );
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Denemelerden Kelime Çıkar</h1>
        <p className="muted">
          Kelimelerim listendeki kelimelerden, seçtiğin denemelerde geçenleri bulur ve "Denemelerden Çıkarılan
          Kelimeler" adında ayrı bir gruba ayırır — tıpkı Günün Kelimeleri gibi, kelime oyunlarında ayrı seçilebilir.
        </p>
      </header>

      {denemes.length === 0 ? (
        <div className="empty"><p>Henüz deneme yok.</p></div>
      ) : (
        <div className="list">
          {denemes.map((d) => (
            <div
              key={d.id}
              className={"card cat-pick-card" + (selected.has(d.id) ? " active" : "")}
              onClick={() => toggle(d.id)}
            >
              <div className="cat-pick-label">
                <input type="checkbox" checked={selected.has(d.id)} readOnly style={{ marginRight: 8 }} />
                {d.name}
              </div>
              <div className="cat-pick-sub muted small">{d.questions.length} soru</div>
            </div>
          ))}
        </div>
      )}

      {selected.size > 0 && (
        <div className="card">
          <p className="muted small" style={{ marginBottom: 8 }}>
            Seçili {selected.size} denemede, kelimelerim listemden <strong>{matchedWords.length}</strong> kelime geçiyor.
          </p>
          <button className="btn btn-primary btn-big" onClick={onExtract} disabled={matchedWords.length === 0}>
            Bu Kelimeleri Ayır ({matchedWords.length})
          </button>
        </div>
      )}

      {msg && <div className="alert alert-ok">{msg}</div>}
    </div>
  );
}
