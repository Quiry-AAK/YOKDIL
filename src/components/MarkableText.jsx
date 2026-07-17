import { useState } from "react";
import { useStore } from "../store.js";

export default function MarkableText({ text, className, sourceType }) {
  const words = useStore((s) => s.words);
  const pendingWords = useStore((s) => s.pendingWords);
  const addPendingWord = useStore((s) => s.addPendingWord);
  const [msg, setMsg] = useState(null);
  const [sel, setSel] = useState(null); // { start, end } — token indeksleri

  if (!text) return null;

  const knownKeys = new Set(words.map((w) => w.word.toLowerCase()));
  const pendingKeys = new Set(pendingWords.map((w) => w.word.toLowerCase()));
  const tokens = text.match(/[A-Za-z'']+|[^A-Za-z'']+/g) || [text];

  // Sadece kelime tokenlarının indeksleri
  const wordIndices = tokens.reduce((acc, tok, i) => {
    if (/[A-Za-z]/.test(tok)) acc.push(i);
    return acc;
  }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(null), 1800); };

  const getPhrase = (start, end) =>
    tokens.slice(start, end + 1).join("").trim().toLowerCase();

  const handleTap = (i) => {
    if (sel) { setSel(null); return; }
    setSel({ start: i, end: i });
  };

  const expand = (dir, e) => {
    e.stopPropagation();
    const curStart = wordIndices.indexOf(sel.start);
    const curEnd = wordIndices.indexOf(sel.end);
    if (dir === -1 && curStart > 0)
      setSel((s) => ({ ...s, start: wordIndices[curStart - 1] }));
    if (dir === 1 && curEnd < wordIndices.length - 1)
      setSel((s) => ({ ...s, end: wordIndices[curEnd + 1] }));
  };

  const confirmSel = (e) => {
    e.stopPropagation();
    const phrase = getPhrase(sel.start, sel.end);
    setSel(null);
    if (!phrase || phrase.length < 2) return;
    if (knownKeys.has(phrase)) flash(`"${phrase}" zaten kelimelerde var.`);
    else if (pendingKeys.has(phrase)) flash(`"${phrase}" zaten bekleme listesinde.`);
    else { addPendingWord(phrase, text, sourceType ?? null); flash(`✓ "${phrase}" bekleme listesine eklendi.`); }
  };

  return (
    <span
      className={className}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onClick={() => sel && setSel(null)}
    >
      {tokens.map((tok, i) => {
        const isWord = /[A-Za-z]/.test(tok);
        if (!isWord) return <span key={i}>{tok}</span>;
        const clean = tok.replace(/['']+$/, "").toLowerCase();
        const marked = knownKeys.has(clean);
        const pending = pendingKeys.has(clean);
        const inSel = sel && i >= sel.start && i <= sel.end;
        return (
          <span
            key={i}
            className={
              "mw" +
              (inSel ? " mw-sel" : marked ? " mw-known" : pending ? " mw-pending" : "")
            }
            onClick={(e) => { e.stopPropagation(); handleTap(i); }}
          >
            {tok}
          </span>
        );
      })}

      {sel && (
        <span className="sel-bar" onClick={(e) => e.stopPropagation()}>
          <button className="sel-btn" onClick={(e) => expand(-1, e)}>◄</button>
          <span className="sel-phrase">{getPhrase(sel.start, sel.end)}</span>
          <button className="sel-btn" onClick={(e) => expand(1, e)}>►</button>
          <button className="sel-confirm" onClick={confirmSel}>✓ Ekle</button>
          <button className="sel-cancel" onClick={(e) => { e.stopPropagation(); setSel(null); }}>✕</button>
        </span>
      )}

      {!sel && msg && <span className="mw-toast">{msg}</span>}
    </span>
  );
}
