import { useState } from "react";
import { useStore } from "../store.js";
import { analyzeWord } from "../lib/ai.js";

// İngilizce kelimeleri tıklanabilir yapar. Tıklanan kelime "bilinmeyen kelimeler"e
// (Kelimeler oyununa) eklenir.
export default function MarkableText({ text, className }) {
  const settings = useStore((s) => s.settings);
  const addWord = useStore((s) => s.addWord);
  const words = useStore((s) => s.words);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);

  if (!text) return null;

  const known = new Set(words.map((w) => w.word.toLowerCase()));
  // Kelime + aradaki boşluk/noktalama olarak parçala.
  const tokens = text.match(/[A-Za-z'’]+|[^A-Za-z'’]+/g) || [text];

  const handleMark = async (raw) => {
    const clean = raw.replace(/['’]+$/, "").toLowerCase();
    if (clean.length < 2) return;
    if (known.has(clean)) {
      setMsg(`"${clean}" zaten kelimelerde var.`);
      setTimeout(() => setMsg(null), 1500);
      return;
    }
    if (!settings.apiKey) {
      setMsg("Önce Ayarlar'dan API anahtarı ekle.");
      setTimeout(() => setMsg(null), 2000);
      return;
    }
    setBusy(clean);
    try {
      const data = await analyzeWord({
        apiKey: settings.apiKey,
        model: settings.model,
        word: clean,
        context: text,
      });
      addWord(data);
      setMsg(`✓ "${clean}" kelimelere eklendi.`);
    } catch (e) {
      setMsg("Hata: " + (e.message || "kelime eklenemedi"));
    } finally {
      setBusy(null);
      setTimeout(() => setMsg(null), 2000);
    }
  };

  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        const isWord = /[A-Za-z]/.test(tok);
        if (!isWord) return <span key={i}>{tok}</span>;
        const clean = tok.replace(/['’]+$/, "").toLowerCase();
        const marked = known.has(clean);
        return (
          <span
            key={i}
            className={
              "mw" + (marked ? " mw-known" : "") + (busy === clean ? " mw-busy" : "")
            }
            onClick={(e) => {
              e.stopPropagation();
              handleMark(tok);
            }}
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
