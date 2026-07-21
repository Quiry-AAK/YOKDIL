import { useEffect, useState } from "react";
import { useStore } from "../store.js";
import { PHRASAL_VERBS, PREP_VERBS, GERUND_INFINITIVE, NOUN_PREP_PATTERNS } from "../lib/vocabPatterns.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";

const SOURCES = [
  { key: "phrasal", label: "Phrasal Verbs", list: PHRASAL_VERBS, kind: "phrasal", itemKey: (it) => it.phrase },
  { key: "prep", label: "Edatlı Fiiller", list: PREP_VERBS, kind: "blank", itemKey: (it) => it.phrase },
  { key: "gerund", label: "Gerund / Infinitive", list: GERUND_INFINITIVE, kind: "blank", itemKey: (it) => it.verb },
  { key: "collocation", label: "Kalıp İfadeler", list: NOUN_PREP_PATTERNS, kind: "blank", itemKey: (it) => it.phrase },
  {
    key: "mix",
    label: "Mix — Hepsi",
    kind: "mixed",
    list: [
      ...PHRASAL_VERBS.map((it) => ({ ...it, __cat: "phrasal", __kind: "phrasal", __key: it.phrase })),
      ...PREP_VERBS.map((it) => ({ ...it, __cat: "prep", __kind: "blank", __key: it.phrase })),
      ...GERUND_INFINITIVE.map((it) => ({ ...it, __cat: "gerund", __kind: "blank", __key: it.verb })),
      ...NOUN_PREP_PATTERNS.map((it) => ({ ...it, __cat: "collocation", __kind: "blank", __key: it.phrase })),
    ],
  },
];

function buildStatement(item, list, kind) {
  const isTrue = Math.random() < 0.5;
  if (kind === "phrasal") {
    let meaning = item.meaning;
    if (!isTrue) {
      const others = list.filter((x) => x.phrase !== item.phrase);
      meaning = others[Math.floor(Math.random() * others.length)]?.meaning ?? item.meaning;
    }
    return { isTrue, sentence: `"${item.phrase}" = "${meaning}"`, sub: item.example?.en };
  }
  const word = isTrue ? item.correct : item.wrong;
  return { isTrue, sentence: `${item.before} ${word} ${item.after}`, sub: item.meaning_tr ?? item.meaning };
}

export default function TrueFalse() {
  const patternStats = useStore((s) => s.patternStats);
  const recordPatternAnswer = useStore((s) => s.recordPatternAnswer);

  const [srcKey, setSrcKey] = useState(null);
  const [stage, setStage] = useState("source"); // source | size | play | score
  const round = useRound();
  const [statement, setStatement] = useState(null);
  const [picked, setPicked] = useState(null);

  const source = SOURCES.find((s) => s.key === srcKey);

  const catOf = (it) => it.__cat ?? srcKey;
  const kindOf = (it) => it.__kind ?? source?.kind;
  const keyOf = (it) => it.__key ?? source?.itemKey(it);
  const statKey = (it) => `${catOf(it)}:${keyOf(it)}`;
  const statsOf = (it) => patternStats[statKey(it)] || { seen: 0, correct: 0 };

  useEffect(() => {
    if (!round.current) { setStatement(null); return; }
    setStatement(buildStatement(round.current, source.list, kindOf(round.current)));
    setPicked(null);
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

  const choose = (userSaysTrue) => {
    if (picked !== null) return;
    const correct = userSaysTrue === statement.isTrue;
    setPicked(userSaysTrue);
    recordPatternAnswer(statKey(round.current), correct);
    setTimeout(() => round.answer(correct), 550);
  };

  if (stage === "source") {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Doğru / Yanlış</h1>
          <p className="muted">Cümle/kalıp doğru mu yanlış mı, hızlıca karar ver.</p>
        </header>
        <div className="list">
          {SOURCES.map((s) => (
            <div key={s.key} className="card cat-pick-card" onClick={() => startSource(s.key)}>
              <div className="cat-pick-label">{s.label}</div>
              <div className="cat-pick-sub muted small">{s.list.length} öğe</div>
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
        <p className="muted" style={{ marginBottom: 12 }}>Kaç tanesini çalışmak istiyorsun? En az görülenler önce gelir.</p>
        <div className="list">
          {roundSizeChoices(source.list.length).map((n) => (
            <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
              <div className="cat-pick-label">{n === source.list.length ? `Tümü (${n})` : `${n} soru`}</div>
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
          <div className="score-row"><span className="score-label">Soru sayısı</span><span className="score-val">{round.total}</span></div>
          <div className="score-row"><span className="score-label">İlk denemede doğru</span><span className="score-val good">{round.firstTryCorrect}</span></div>
          <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
        </div>
      </div>
    );
  }

  if (!round.current || !statement) return null;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setStage("source")}>← {source.label}</button>
        <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
      </header>

      <div className="card game-card">
        <p className="muted small">{statement.sub}</p>
        <div className="tf-sentence">{statement.sentence}</div>
        <div className="tf-buttons">
          <button
            className={"tf-btn tf-false" + (picked === false ? (statement.isTrue ? " wrong" : " correct") : "")}
            disabled={picked !== null}
            onClick={() => choose(false)}
          >
            ✗ Yanlış
          </button>
          <button
            className={"tf-btn tf-true" + (picked === true ? (statement.isTrue ? " correct" : " wrong") : "")}
            disabled={picked !== null}
            onClick={() => choose(true)}
          >
            ✓ Doğru
          </button>
        </div>
        {picked !== null && (
          <div className={"feedback " + (picked === statement.isTrue ? "good" : "bad")}>
            {picked === statement.isTrue ? "✓ Doğru bildin!" : `✗ Yanlış. Bu ifade ${statement.isTrue ? "doğruydu" : "yanlıştı"}.`}
          </div>
        )}
      </div>
    </div>
  );
}
