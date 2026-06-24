import { useState, useRef, useEffect } from "react";
import { useStore } from "../store.js";

export default function MarkableText({ text, className }) {
  const words = useStore((s) => s.words);
  const pendingWords = useStore((s) => s.pendingWords);
  const addPendingWord = useStore((s) => s.addPendingWord);
  const [msg, setMsg] = useState(null);
  const [selPhrase, setSelPhrase] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    const onSelChange = () => {
      const sel = window.getSelection();
      const raw = sel?.toString().trim();
      if (
        raw && raw.length > 2 &&
        containerRef.current?.contains(sel.anchorNode)
      ) {
        const cleaned = raw.replace(/[^A-Za-z\s'''-]/g, " ").trim().replace(/\s+/g, " ").toLowerCase();
        if (cleaned.includes(" ")) setSelPhrase(cleaned);
        else setSelPhrase(null);
      } else {
        setSelPhrase(null);
      }
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  if (!text) return null;

  const knownKeys = new Set(words.map((w) => w.word.toLowerCase()));
  const pendingKeys = new Set(pendingWords.map((w) => w.word.toLowerCase()));
  const tokens = text.match(/[A-Za-z'']+|[^A-Za-z'']+/g) || [text];

  const addPhrase = (phrase) => {
    window.getSelection()?.removeAllRanges();
    setSelPhrase(null);
    if (knownKeys.has(phrase)) {
      flash(`"${phrase}" zaten kelimelerde var.`);
    } else if (pendingKeys.has(phrase)) {
      flash(`"${phrase}" zaten bekleme listesinde.`);
    } else {
      addPendingWord(phrase, text);
      flash(`✓ "${phrase}" bekleme listesine eklendi.`);
    }
  };

  const handleMark = (raw) => {
    const clean = raw.replace(/['']+$/, "").toLowerCase();
    if (clean.length < 2) return;
    if (knownKeys.has(clean)) flash(`"${clean}" zaten kelimelerde var.`);
    else if (pendingKeys.has(clean)) flash(`"${clean}" zaten bekleme listesinde.`);
    else { addPendingWord(clean, text); flash(`✓ "${clean}" bekleme listesine eklendi.`); }
  };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(null), 1800); };

  return (
    <span className={className} ref={containerRef}>
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
            onClick={(e) => { e.stopPropagation(); if (!window.getSelection()?.toString().trim()) handleMark(tok); }}
            title="Kelimeyi işaretle"
          >
            {tok}
          </span>
        );
      })}
      {selPhrase && (
        <span className="mw-toast mw-phrase-toast">
          <span>"{selPhrase}"</span>
          <button className="phrase-add-btn" onClick={() => addPhrase(selPhrase)}>+ Ekle</button>
          <button className="phrase-cancel-btn" onClick={() => { window.getSelection()?.removeAllRanges(); setSelPhrase(null); }}>✕</button>
        </span>
      )}
      {!selPhrase && msg && <span className="mw-toast">{msg}</span>}
    </span>
  );
}
