import { useState } from "react";
import { useStore } from "../store.js";

export default function MarkableText({ text, className }) {
  const words = useStore((s) => s.words);
  const pendingWords = useStore((s) => s.pendingWords);
  const addPendingWord = useStore((s) => s.addPendingWord);
  const [msg, setMsg] = useState(null);

  if (!text) return null;

  const knownKeys = new Set(words.map((w) => w.word.toLowerCase()));
  const pendingKeys = new Set(pendingWords.map((w) => w.word.toLowerCase()));
  const tokens = text.match(/[A-Za-z'']+|[^A-Za-z'']+/g) || [text];

  const handleMark = (raw) => {
    const clean = raw.replace(/['']+$/, "").toLowerCase();
    if (clean.length < 2) return;
    if (knownKeys.has(clean)) {
      setMsg(`"${clean}" zaten kelimelerde var.`);
    } else if (pendingKeys.has(clean)) {
      setMsg(`"${clean}" zaten bekleme listesinde.`);
    } else {
      addPendingWord(clean, text);
      setMsg(`✓ "${clean}" bekleme listesine eklendi.`);
    }
    setTimeout(() => setMsg(null), 1800);
  };

  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        const isWord = /[A-Za-z]/.test(tok);
        if (!isWord) return <span key={i}>{tok}</span>;
        const clean = tok.replace(/['']+$/, "").toLowerCase();
        const marked = knownKeys.has(clean);
        const pending = pendingKeys.has(clean);
        return (
          <span
            key={i}
            className={"mw" + (marked ? " mw-known" : "") + (pending ? " mw-pending" : "")}
            onClick={(e) => { e.stopPropagation(); handleMark(tok); }}
            title="Kelimeyi işaretle"
          >
            {tok}
          </span>
        );
      })}
      {msg && <span className="mw-toast">{msg}</span>}
    </span>
  );
}
