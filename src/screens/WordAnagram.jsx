import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store.js";
import { shuffle, pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";
import { buildWordGroups } from "../lib/wordSources.js";

function buildLetterTiles(word) {
  const correctLetters = word.toLowerCase().split("");
  const allTiles = shuffle(correctLetters.map((ch, i) => ({ id: `l${i}`, ch })));
  return { correctLetters, allTiles };
}

export default function WordAnagram() {
  const words = useStore((s) => s.words);
  const dailyWords = useStore((s) => s.dailyWords);
  const dailyWordsHistory = useStore((s) => s.dailyWordsHistory);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const groups = useMemo(() => buildWordGroups(words, dailyWords, dailyWordsHistory), [words, dailyWords, dailyWordsHistory]);

  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const round = useRound();
  const [tiles, setTiles] = useState(null); // { correctLetters, pool, placed }
  const [checked, setChecked] = useState(null); // null | boolean

  const poolFor = (key) => groups.find((g) => g.key === key)?.pool ?? [];

  useEffect(() => {
    if (!round.current) { setTiles(null); return; }
    const { correctLetters, allTiles } = buildLetterTiles(round.current.word);
    setTiles({ correctLetters, pool: allTiles, placed: [] });
    setChecked(null);
  }, [round.current]);

  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const startGroup = (g) => {
    setGroup(g);
    setStage("size");
  };

  const startRound = (n) => {
    const pool = pickLeastSeen(poolFor(group), (w) => w.stats, n);
    round.start(pool, (w) => w.word);
    setStage("play");
  };

  const tapPoolTile = (tile) => {
    if (checked !== null) return;
    setTiles((t) => ({ ...t, pool: t.pool.filter((x) => x.id !== tile.id), placed: [...t.placed, tile] }));
  };

  const tapPlacedTile = (tile) => {
    if (checked !== null) return;
    setTiles((t) => ({ ...t, placed: t.placed.filter((x) => x.id !== tile.id), pool: [...t.pool, tile] }));
  };

  const onCheck = () => {
    const isCorrect = tiles.placed.map((t) => t.ch).join("") === tiles.correctLetters.join("");
    setChecked(isCorrect);
    recordWordAnswer(round.current.word, isCorrect);
  };

  const onNext = () => {
    round.answer(checked);
  };

  return (
    <div className="screen">
      {stage === "group" && (
        <>
          <header className="screen-head">
            <h1>Harf Karıştırma</h1>
            <p className="muted">Karışık harflerden dokunarak doğru kelimeyi kur.</p>
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
            <button className="link" onClick={() => setStage("group")}>← Harf Karıştırma</button>
          </header>
          <p className="muted" style={{ marginBottom: 12 }}>Kaç kelime çalışmak istiyorsun? En az görülenler önce gelir.</p>
          <div className="list">
            {roundSizeChoices(poolFor(group).length).map((n) => (
              <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
                <div className="cat-pick-label">{n === poolFor(group).length ? `Tümü (${n})` : `${n} kelime`}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {stage === "score" && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Harf Karıştırma</button>
          </header>
          <div className="card score-card">
            <div className="score-big">%{round.total ? Math.round((round.firstTryCorrect / round.total) * 100) : 0}</div>
            <p className="muted small" style={{ margin: "-12px 0 16px" }}>tur puanı (ilk denemede doğru oranı)</p>
            <div className="score-row"><span className="score-label">Kelime sayısı</span><span className="score-val">{round.total}</span></div>
            <div className="score-row"><span className="score-label">İlk denemede doğru</span><span className="score-val good">{round.firstTryCorrect}</span></div>
            <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
          </div>
        </>
      )}

      {stage === "play" && round.current && tiles && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Harf Karıştırma</button>
            <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
          </header>

          <div className="card game-card">
            <p className="muted small" style={{ marginBottom: 4 }}>{round.current.meaning_tr}</p>
            <p className="tf-sentence" style={{ fontSize: 15 }}>{round.current.example_tr}</p>

            <div className="tile-answer-area">
              {tiles.placed.length === 0 && <span className="muted small">Aşağıdaki harflere dokunarak kelimeyi buraya kur</span>}
              {tiles.placed.map((t) => (
                <button key={t.id} className="tile tile-placed tile-letter" onClick={() => tapPlacedTile(t)}>{t.ch}</button>
              ))}
            </div>

            <div className="tile-pool-area">
              {tiles.pool.map((t) => (
                <button key={t.id} className="tile tile-letter" onClick={() => tapPoolTile(t)}>{t.ch}</button>
              ))}
            </div>

            {checked === null ? (
              <button
                className="btn btn-primary btn-big"
                style={{ marginTop: 16 }}
                disabled={tiles.placed.length !== tiles.correctLetters.length}
                onClick={onCheck}
              >
                Kontrol Et
              </button>
            ) : (
              <div className="reveal">
                <div className={"feedback " + (checked ? "good" : "bad")}>
                  {checked ? "✓ Doğru!" : "✗ Yanlış."}
                </div>
                <div className="reveal-detail">
                  <span className="pos-tag">{round.current.pos}</span>
                  <p className="meaning">Doğrusu: {round.current.word}</p>
                  <p className="example">"{round.current.example_en}"</p>
                  <p className="example-tr muted">{round.current.example_tr}</p>
                </div>
                <button className="btn btn-primary btn-big" onClick={onNext}>Sonraki →</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
