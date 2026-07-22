import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store.js";
import { shuffle } from "../lib/round.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";
import { buildWordGroups } from "../lib/wordSources.js";

function findBlank(word, sentence) {
  if (!word || !sentence) return null;
  const esc = word.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = sentence.match(new RegExp(`\\b${esc}\\w*`, "i"));
  if (!m) return null;
  return { pre: sentence.slice(0, m.index), matched: m[0], post: sentence.slice(m.index + m[0].length) };
}

export default function WordBlank() {
  const words = useStore((s) => s.words);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const academicWordStats = useStore((s) => s.academicWordStats);
  const recordAcademicWordAnswer = useStore((s) => s.recordAcademicWordAnswer);
  const groups = useMemo(() => buildWordGroups(words, academicWordStats), [words, academicWordStats]);

  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const round = useRound();
  const [blank, setBlank] = useState(null); // { pre, matched, post }
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);

  const poolFor = (key) => (groups.find((g) => g.key === key)?.pool ?? []).filter((w) => findBlank(w.word, w.example_en));
  const activeKind = groups.find((g) => g.key === group)?.kind;
  const recordAnswer = (word, correct) => {
    if (activeKind === "academic") recordAcademicWordAnswer(word, correct);
    else recordWordAnswer(word, correct);
  };

  useEffect(() => {
    if (!round.current || !group) { setBlank(null); setChoices([]); return; }
    const b = findBlank(round.current.word, round.current.example_en);
    setBlank(b);
    const others = poolFor(group)
      .filter((w) => w.word.toLowerCase() !== round.current.word.toLowerCase());
    const samePos = others.filter((w) => w.pos && w.pos === round.current.pos);
    const decoyPool = samePos.length >= 3 ? samePos : others;
    const decoys = shuffle(decoyPool).slice(0, 3).map((w) => w.word);
    setChoices(shuffle([round.current.word, ...decoys]).map((t) => ({
      text: t, correct: t.toLowerCase() === round.current.word.toLowerCase(),
    })));
    setPicked(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    recordAnswer(round.current.word, opt.correct);
  };

  const onNext = () => {
    round.answer(picked.correct);
  };

  return (
    <div className="screen">
      {stage === "group" && (
        <>
          <header className="screen-head">
            <h1>Boşluk Doldurma</h1>
            <p className="muted">Cümledeki boşluğa hangi kelime gelmeli?</p>
          </header>
          {groups.every((g) => poolFor(g.key).length === 0) ? (
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
            <button className="link" onClick={() => setStage("group")}>← Boşluk Doldurma</button>
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

      {stage === "play" && round.current && blank && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Boşluk Doldurma</button>
            <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
          </header>
          <div className="card game-card">
            <p className="muted small" style={{ marginBottom: 4 }}>{round.current.example_tr}</p>
            <div className="passage">
              {blank.pre}<span className="cloze-active-blank">_______</span>{blank.post}
            </div>
            <p className="muted">Boşluğa hangi kelime gelmeli?</p>
            <div className="options">
              {choices.map((opt, i) => {
                let cls = "option";
                if (picked) { if (opt.correct) cls += " correct"; else if (opt === picked) cls += " wrong"; }
                return (
                  <button key={i} className={cls} disabled={!!picked} onClick={() => pick(opt)}>
                    <span className="opt-text">{opt.text}</span>
                  </button>
                );
              })}
            </div>
            {picked && (
              <div className="reveal">
                <div className={"feedback " + (picked.correct ? "good" : "bad")}>
                  {picked.correct ? "✓ Doğru!" : `✗ Yanlış. Doğrusu: ${round.current.word}`}
                </div>
                <div className="reveal-detail">
                  <span className="pos-tag">{round.current.pos}</span>
                  <p className="meaning">{round.current.word} = {round.current.meaning_tr}</p>
                  <p className="example">"{round.current.example_en}"</p>
                  <p className="example-tr muted">{round.current.example_tr}</p>
                </div>
                <button className="btn btn-primary btn-big" onClick={onNext}>Sonraki →</button>
              </div>
            )}
          </div>
        </>
      )}

      {stage === "score" && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Boşluk Doldurma</button>
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
    </div>
  );
}
