import { useState } from "react";
import { useStore } from "../store.js";

const CAPACITIES = [10, 20, 30];
const SOURCES = [
  { key: "mix", label: "Tümü" },
  { key: "yokdil", label: "YÖKDİL" },
  { key: "yds", label: "YDS" },
  { key: "diger", label: "Diğer" },
];

export default function DailyWords() {
  const words = useStore((s) => s.words);
  const dailyWords = useStore((s) => s.dailyWords);
  const dailyWordsHistory = useStore((s) => s.dailyWordsHistory);
  const pullDailyWords = useStore((s) => s.pullDailyWords);
  const resetDailyWords = useStore((s) => s.resetDailyWords);

  const [capacity, setCapacity] = useState(10);
  const [source, setSource] = useState("mix");
  const [tab, setTab] = useState("today"); // today | history

  const historySet = new Set(dailyWordsHistory);
  const sourcePool = source === "mix" ? words : words.filter((w) => w.sourceType === source);
  const availableCount = sourcePool.filter((w) => !historySet.has(w.word)).length;

  const dailySet = new Set(dailyWords);
  const currentWords = words.filter((w) => dailySet.has(w.word));
  const historyWords = words.filter((w) => historySet.has(w.word));
  const shown = tab === "today" ? currentWords : historyWords;

  const onPull = () => {
    pullDailyWords(capacity, source);
    setTab("today");
  };

  const onReset = () => {
    if (confirm("Günün kelimeleri geçmişi sıfırlansın mı? Tüm kelimeler tekrar çekilebilir hale gelir.")) {
      resetDailyWords();
    }
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Günün Kelimeleri</h1>
        <p className="muted">Rastgele kelime çek, oyunlarda "Günün Kelimeleri" grubundan çalış. Çekilen bir kelime bir daha çekilmez.</p>
      </header>

      <div className="card">
        <p className="muted small" style={{ marginBottom: 8 }}>Hangi kategoriden çekilsin?</p>
        <div className="seg seg-wrap">
          {SOURCES.map((s) => (
            <button key={s.key} className={source === s.key ? "active" : ""} onClick={() => setSource(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="muted small" style={{ margin: "10px 0 8px" }}>Kaç kelime çekilsin?</p>
        <div className="seg seg-wrap">
          {CAPACITIES.map((n) => (
            <button key={n} className={capacity === n ? "active" : ""} onClick={() => setCapacity(n)}>
              {n}
            </button>
          ))}
        </div>
        <p className="muted small" style={{ margin: "10px 0" }}>
          Havuzda henüz çekilmemiş {availableCount} kelime var.
        </p>
        <button className="btn btn-primary btn-big" onClick={onPull} disabled={availableCount === 0}>
          Günün Kelimelerini Çek
        </button>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: "100%" }} onClick={onReset}>
          🔄 Geçmişi Sıfırla
        </button>
      </div>

      <div className="seg" style={{ marginTop: 16, marginBottom: 12 }}>
        <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>
          Bugün ({currentWords.length})
        </button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
          Bugüne Kadar ({historyWords.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <p>{tab === "today" ? "Henüz günün kelimelerini çekmedin." : "Henüz hiç kelime çekilmedi."}</p>
        </div>
      ) : (
        <div className="list">
          {shown.map((w) => (
            <div key={w.word} className="card word-card">
              <div className="word-head">
                <h3>{w.word}</h3>
                <span className="pos-tag">{w.pos}</span>
              </div>
              <p className="meaning">{w.meaning_tr}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
