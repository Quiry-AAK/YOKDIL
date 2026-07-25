import { useEffect, useRef, useState, useMemo } from "react";
import { useStore } from "../store.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";
import { buildWordGroups } from "../lib/wordSources.js";

export default function WordCards() {
  const words = useStore((s) => s.words);
  const dailyWords = useStore((s) => s.dailyWords);
  const dailyWordsHistory = useStore((s) => s.dailyWordsHistory);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const groups = useMemo(() => buildWordGroups(words, dailyWords, dailyWordsHistory), [words, dailyWords, dailyWordsHistory]);

  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const round = useRound();
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);

  useEffect(() => {
    setFlipped(false);
    setDragX(0);
  }, [round.current]);

  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const poolFor = (key) => groups.find((g) => g.key === key)?.pool ?? [];

  const startGroup = (g) => {
    setGroup(g);
    setStage("size");
  };

  const startRound = (n) => {
    const pool = pickLeastSeen(poolFor(group), (w) => w.stats, n);
    round.start(pool, (w) => w.word);
    setStage("play");
  };

  const decide = (knew) => {
    recordWordAnswer(round.current.word, knew);
    round.answer(knew);
  };

  const onPointerDown = (e) => {
    if (!flipped) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    setDragX(e.clientX - startXRef.current);
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragX > 80) decide(true);
    else if (dragX < -80) decide(false);
    else setDragX(0);
  };

  return (
    <div className="screen">
      {stage === "group" && (
        <>
          <header className="screen-head"><h1>Kelime Kartları</h1></header>
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
                    className={"card cat-pick-card" + (count === 0 ? " disabled" : "")}
                    onClick={() => count > 0 && startGroup(g.key)}
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
            <button className="link" onClick={() => setStage("group")}>← Kelime Kartları</button>
          </header>
          <p className="muted" style={{ marginBottom: 12 }}>Kaç kart çalışmak istiyorsun? En az görülenler önce gelir.</p>
          <div className="list">
            {roundSizeChoices(poolFor(group).length).map((n) => (
              <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
                <div className="cat-pick-label">{n === poolFor(group).length ? `Tümü (${n})` : `${n} kart`}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {stage === "play" && round.current && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Kelime Kartları</button>
            <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
          </header>
          <p className="muted small" style={{ marginBottom: 10 }}>
            Kartı çevir, kendi kendine tahmin et. Bildiysen sağa, bilemediysen sola sürükle (ya da alttaki butonları kullan).
          </p>
          <div
            className={"flip-card" + (dragX > 40 ? " swipe-right" : dragX < -40 ? " swipe-left" : "")}
            style={{ transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onClick={() => !flipped && setFlipped(true)}
          >
            {!flipped ? (
              <div className="flip-card-front">
                <div className="game-word">{round.current.word}</div>
                <p className="muted small">Kartı çevirmek için dokun</p>
              </div>
            ) : (
              <div className="flip-card-back">
                <span className="pos-tag">{round.current.pos}</span>
                <p className="meaning">{round.current.word} = {round.current.meaning_tr}</p>
                <p className="example">"{round.current.example_en}"</p>
                <p className="example-tr muted">{round.current.example_tr}</p>
              </div>
            )}
          </div>
          {flipped && (
            <div className="flip-decide-row">
              <button className="btn btn-sm flip-btn-no" onClick={() => decide(false)}>✗ Bilemedim</button>
              <button className="btn btn-sm flip-btn-yes" onClick={() => decide(true)}>✓ Bildim</button>
            </div>
          )}
        </>
      )}

      {stage === "score" && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Kelime Kartları</button>
          </header>
          <div className="card score-card">
            <div className="score-big">%{round.total ? Math.round((round.firstTryCorrect / round.total) * 100) : 0}</div>
            <p className="muted small" style={{ margin: "-12px 0 16px" }}>tur puanı (ilk denemede bildiğin oranı)</p>
            <div className="score-row"><span className="score-label">Kart sayısı</span><span className="score-val">{round.total}</span></div>
            <div className="score-row"><span className="score-label">İlk denemede bildiğin</span><span className="score-val good">{round.firstTryCorrect}</span></div>
            <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
          </div>
        </>
      )}
    </div>
  );
}
