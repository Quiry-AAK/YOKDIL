import { useState, useRef, useEffect, useMemo } from "react";
import { useStore } from "../store.js";
import { shuffle, pickLeastSeen } from "../lib/round.js";
import { buildWordGroups } from "../lib/wordSources.js";

function matchSizeChoices(poolLength) {
  const opts = [4, 6, 8].filter((n) => n <= poolLength);
  return opts.length ? opts : poolLength >= 2 ? [poolLength] : [];
}

function buildCards(picked) {
  const cards = picked.flatMap((w) => [
    { id: `${w.word}-en`, wordKey: w.word, side: "en", text: w.word },
    { id: `${w.word}-tr`, wordKey: w.word, side: "tr", text: w.meaning_tr },
  ]);
  return shuffle(cards);
}

export default function WordMatch() {
  const words = useStore((s) => s.words);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const groups = useMemo(() => buildWordGroups(words), [words]);

  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [wrongPair, setWrongPair] = useState([]);
  const [moves, setMoves] = useState(0);
  const busyRef = useRef(false);

  const poolFor = (key) => groups.find((g) => g.key === key)?.pool ?? [];

  const startGroup = (g) => {
    setGroup(g);
    setStage("size");
  };

  const startRound = (n) => {
    const picked = pickLeastSeen(poolFor(group), (w) => w.stats, n);
    setCards(buildCards(picked));
    setFlipped([]);
    setMatched(new Set());
    setWrongPair([]);
    setMoves(0);
    setStage("play");
  };

  const tapCard = (card) => {
    if (busyRef.current) return;
    if (flipped.includes(card.id) || matched.has(card.wordKey)) return;
    if (flipped.length === 2) return;

    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length !== 2) return;

    const [firstId, secondId] = next;
    const first = cards.find((c) => c.id === firstId);
    const second = cards.find((c) => c.id === secondId);
    setMoves((m) => m + 1);

    if (first.wordKey === second.wordKey && first.side !== second.side) {
      recordWordAnswer(first.wordKey, true);
      setMatched((prev) => new Set(prev).add(first.wordKey));
      setFlipped([]);
    } else {
      busyRef.current = true;
      setWrongPair(next);
      setTimeout(() => {
        setFlipped([]);
        setWrongPair([]);
        busyRef.current = false;
      }, 700);
    }
  };

  const totalPairs = cards.length / 2;

  useEffect(() => {
    if (stage === "play" && totalPairs > 0 && matched.size === totalPairs) setStage("score");
  }, [matched, stage, totalPairs]);

  return (
    <div className="screen">
      {stage === "group" && (
        <>
          <header className="screen-head">
            <h1>Eşleştirme</h1>
            <p className="muted">Kartları çevirip kelime ile Türkçe anlamını eşleştir.</p>
          </header>
          {groups.every((g) => g.pool.length === 0) ? (
            <div className="empty">
              <p>Henüz kelime yok.</p>
              <p className="muted">Soru çözerken kelimelere dokun; buraya düşsünler.</p>
            </div>
          ) : (
            <div className="list">
              <p className="muted" style={{ marginBottom: 12 }}>Hangi kelimelerle çalışmak istiyorsun?</p>
              {groups.map((g) => {
                const count = poolFor(g.key).length;
                return (
                  <div
                    key={g.key}
                    className={"card cat-pick-card" + (count < 2 ? " disabled" : "")}
                    onClick={() => count >= 2 && startGroup(g.key)}
                  >
                    <div className="cat-pick-label">{g.label}</div>
                    <div className="cat-pick-sub muted small">{count} kelime</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {stage === "size" && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Eşleştirme</button>
          </header>
          <p className="muted" style={{ marginBottom: 12 }}>Kaç çift ile oynamak istiyorsun?</p>
          <div className="list">
            {matchSizeChoices(poolFor(group).length).map((n) => (
              <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
                <div className="cat-pick-label">{n} çift</div>
              </div>
            ))}
          </div>
        </>
      )}

      {stage === "play" && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Eşleştirme</button>
            <span className="muted small">Eşleşen: {matched.size} / {totalPairs} · Hamle: {moves}</span>
          </header>
          <div className="match-grid">
            {cards.map((c) => {
              const isMatched = matched.has(c.wordKey);
              const isFlipped = flipped.includes(c.id) || isMatched;
              const isWrong = wrongPair.includes(c.id);
              let cls = "match-card";
              if (isFlipped) cls += " flipped";
              if (isMatched) cls += " matched";
              if (isWrong) cls += " wrong";
              return (
                <button key={c.id} className={cls} data-wordkey={c.wordKey} onClick={() => tapCard(c)}>
                  {isFlipped ? c.text : "?"}
                </button>
              );
            })}
          </div>
        </>
      )}

      {stage === "score" && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Eşleştirme</button>
          </header>
          <div className="card score-card">
            <div className="score-big">%{moves ? Math.round((totalPairs / moves) * 100) : 100}</div>
            <p className="muted small" style={{ margin: "-12px 0 16px" }}>verimlilik (çift / hamle)</p>
            <div className="score-row"><span className="score-label">Çift sayısı</span><span className="score-val">{totalPairs}</span></div>
            <div className="score-row"><span className="score-label">Toplam hamle</span><span className="score-val">{moves}</span></div>
            <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
          </div>
        </>
      )}
    </div>
  );
}
