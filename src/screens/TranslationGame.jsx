import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { PHRASAL_VERBS, PREP_VERBS, NOUN_PREP_PATTERNS } from "../lib/vocabPatterns.js";
import { CONFUSED_PAIRS } from "../lib/grammarTopics.js";
import { shuffle, pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";

function tag(list, cat) {
  return list.map((it) => ({ ...it, __cat: cat }));
}

const confusedItems = tag(
  CONFUSED_PAIRS.flatMap((p) => p.examples.map((ex, i) => ({ en: ex.en, tr: ex.tr, __key: `${p.id}-${i}` }))),
  "confused"
);
const phrasalItems = tag(PHRASAL_VERBS.map((it) => ({ en: it.example.en, tr: it.example.tr, __key: it.phrase })), "phrasal");
const prepItems = tag(PREP_VERBS.map((it) => ({ en: it.example.en, tr: it.example.tr, __key: it.phrase })), "prep");
const collocationItems = tag(NOUN_PREP_PATTERNS.map((it) => ({ en: it.example.en, tr: it.example.tr, __key: it.phrase })), "collocation");

const SOURCES = [
  { key: "phrasal", label: "Phrasal Verbs", list: phrasalItems },
  { key: "prep", label: "Edatlı Fiiller", list: prepItems },
  { key: "collocation", label: "Kalıp İfadeler", list: collocationItems },
  { key: "confused", label: "Karıştırılanlar", list: confusedItems },
  { key: "mix", label: "Mix — Hepsi", list: [...phrasalItems, ...prepItems, ...collocationItems, ...confusedItems] },
];

function buildTiles(item, pool) {
  const correctTiles = item.en.trim().split(/\s+/);
  const otherWords = pool
    .filter((x) => x !== item)
    .flatMap((x) => x.en.trim().split(/\s+/))
    .filter((w) => w.length >= 4 && !correctTiles.includes(w));
  const decoys = shuffle(otherWords).slice(0, 3);
  const allTiles = shuffle(
    correctTiles.map((w, i) => ({ id: `c${i}`, word: w })).concat(decoys.map((w, i) => ({ id: `d${i}`, word: w })))
  );
  return { correctTiles, allTiles };
}

export default function TranslationGame() {
  const examStats = useStore((s) => s.examStats);
  const recordExamAnswer = useStore((s) => s.recordExamAnswer);

  const [srcKey, setSrcKey] = useState(null);
  const [stage, setStage] = useState("source"); // source | size | play | score
  const round = useRound();
  const [tiles, setTiles] = useState(null); // { correctTiles, pool, placed }
  const [checked, setChecked] = useState(null); // null | boolean

  const source = SOURCES.find((s) => s.key === srcKey);
  const statKey = (it) => `tr:${it.__cat}:${it.__key}`;
  const statsOf = (it) => examStats[statKey(it)] || { seen: 0, correct: 0 };

  useEffect(() => {
    if (!round.current) { setTiles(null); return; }
    const { correctTiles, allTiles } = buildTiles(round.current, source.list);
    setTiles({ correctTiles, pool: allTiles, placed: [] });
    setChecked(null);
  }, [round.current]);

  useEffect(() => {
    if (round.finished && stage === "play") setStage("score");
  }, [round.finished]);

  const startSource = (key) => {
    setSrcKey(key);
    setStage("size");
  };

  const startRound = (n) => {
    const pool = pickLeastSeen(source.list, statsOf, n);
    round.start(pool, statKey);
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
    const isCorrect = tiles.placed.map((t) => t.word).join(" ") === tiles.correctTiles.join(" ");
    setChecked(isCorrect);
    recordExamAnswer(statKey(round.current), isCorrect);
  };

  const onNext = () => {
    round.answer(checked);
  };

  if (stage === "source") {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Çeviri</h1>
          <p className="muted">Türkçe cümleyi İngilizce kelime/öbek parçalarını doğru sırayla dizerek kur.</p>
        </header>
        <div className="list">
          {SOURCES.map((s) => (
            <div key={s.key} className="card cat-pick-card" onClick={() => startSource(s.key)}>
              <div className="cat-pick-label">{s.label}</div>
              <div className="cat-pick-sub muted small">{s.list.length} cümle</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "size") {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("source")}>← {source.label}</button>
        </header>
        <p className="muted" style={{ marginBottom: 12 }}>Kaç cümle çalışmak istiyorsun? En az görülenler önce gelir.</p>
        <div className="list">
          {roundSizeChoices(source.list.length).map((n) => (
            <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
              <div className="cat-pick-label">{n === source.list.length ? `Tümü (${n})` : `${n} cümle`}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "score") {
    return (
      <div className="screen">
        <header className="screen-head solve-head">
          <button className="link" onClick={() => setStage("source")}>← {source.label}</button>
        </header>
        <div className="card score-card">
          <div className="score-big">%{round.total ? Math.round((round.firstTryCorrect / round.total) * 100) : 0}</div>
          <p className="muted small" style={{ margin: "-12px 0 16px" }}>tur puanı (ilk denemede doğru oranı)</p>
          <div className="score-row"><span className="score-label">Cümle sayısı</span><span className="score-val">{round.total}</span></div>
          <div className="score-row"><span className="score-label">İlk denemede doğru</span><span className="score-val good">{round.firstTryCorrect}</span></div>
          <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
        </div>
      </div>
    );
  }

  if (!round.current || !tiles) return null;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setStage("source")}>← {source.label}</button>
        <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
      </header>

      <div className="card game-card">
        <p className="tf-sentence" style={{ fontSize: 16 }}>{round.current.tr}</p>

        <div className="tile-answer-area">
          {tiles.placed.length === 0 && <span className="muted small">Aşağıdaki parçalara dokunarak cümleyi buraya kur</span>}
          {tiles.placed.map((t) => (
            <button key={t.id} className="tile tile-placed" onClick={() => tapPlacedTile(t)}>{t.word}</button>
          ))}
        </div>

        <div className="tile-pool-area">
          {tiles.pool.map((t) => (
            <button key={t.id} className="tile" onClick={() => tapPoolTile(t)}>{t.word}</button>
          ))}
        </div>

        {checked === null ? (
          <button
            className="btn btn-primary btn-big"
            style={{ marginTop: 16 }}
            disabled={tiles.placed.length !== tiles.correctTiles.length}
            onClick={onCheck}
          >
            Kontrol Et
          </button>
        ) : (
          <div className="reveal">
            <div className={"feedback " + (checked ? "good" : "bad")}>
              {checked ? "✓ Doğru!" : "✗ Yanlış."}
            </div>
            {!checked && <p className="explain-text">Doğrusu: {tiles.correctTiles.join(" ")}</p>}
            <button className="btn btn-primary btn-big" onClick={onNext}>Sonraki →</button>
          </div>
        )}
      </div>
    </div>
  );
}
