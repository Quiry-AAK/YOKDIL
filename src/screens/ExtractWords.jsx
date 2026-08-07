import { useState, useMemo } from "react";
import { useStore } from "../store.js";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "than", "so", "because", "as", "of", "to", "in", "on",
  "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after",
  "above", "below", "from", "up", "down", "out", "off", "over", "under", "again", "further", "once", "is",
  "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing",
  "will", "would", "should", "could", "can", "may", "might", "must", "shall", "not", "no", "nor", "this",
  "that", "these", "those", "you", "he", "she", "it", "we", "they", "them", "his", "her", "its", "our",
  "their", "your", "which", "who", "whom", "what", "when", "where", "why", "how", "all", "each", "few",
  "more", "most", "other", "some", "such", "only", "own", "same", "too", "very", "just", "also", "there",
  "here",
]);

function extractWordsFromText(text) {
  if (!text) return [];
  const matches = text.match(/[A-Za-z']+/g) || [];
  return matches
    .map((w) => w.replace(/^'+|'+$/g, "").toLowerCase())
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

export default function ExtractWords() {
  const denemes = useStore((s) => s.denemes);
  const words = useStore((s) => s.words);
  const pendingWords = useStore((s) => s.pendingWords);
  const addPendingWords = useStore((s) => s.addPendingWords);

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

  const knownKeys = useMemo(() => new Set(words.map((w) => w.word.toLowerCase())), [words]);
  const pendingKeys = useMemo(() => new Set(pendingWords.map((w) => w.word)), [pendingWords]);

  const preview = useMemo(() => {
    const set = new Set();
    denemes
      .filter((d) => selected.has(d.id))
      .forEach((d) => {
        d.questions.forEach((q) => {
          [q.passage, q.text, ...Object.values(q.options || {})].forEach((t) => {
            extractWordsFromText(t).forEach((w) => set.add(w));
          });
        });
      });
    const newOnes = [...set].filter((w) => !knownKeys.has(w) && !pendingKeys.has(w));
    return { total: set.size, newOnes };
  }, [denemes, selected, knownKeys, pendingKeys]);

  const onExtract = () => {
    const items = preview.newOnes.map((w) => ({ word: w, context: null, sourceType: "denemeler" }));
    const n = addPendingWords(items);
    setSelected(new Set());
    setMsg(`${n} yeni kelime bekleme listesine eklendi. "Kelimeler" ekranından gönderip listeye ekleyebilirsin.`);
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Denemelerden Kelime Çıkar</h1>
        <p className="muted">
          Seçtiğin denemelerdeki İngilizce metinlerden kelimeleri tarar, ayrı bir "Denemelerden Çıkarılan
          Kelimeler" listesine eklenmek üzere bekleme listesine atar — tıpkı Günün Kelimeleri gibi, kelime
          oyunlarında ayrı bir grup olarak seçilebilir.
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
            Seçili {selected.size} denemede toplam {preview.total} benzersiz kelime var,
            bunlardan <strong>{preview.newOnes.length}</strong> tanesi yeni (henüz eklenmemiş).
          </p>
          <button className="btn btn-primary btn-big" onClick={onExtract} disabled={preview.newOnes.length === 0}>
            Kelimeleri Çıkar ({preview.newOnes.length})
          </button>
        </div>
      )}

      {msg && <div className="alert alert-ok">{msg}</div>}
    </div>
  );
}
