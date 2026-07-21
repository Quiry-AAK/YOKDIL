import { useState, useEffect } from "react";
import { useStore } from "../store.js";
import { pickLeastSeen, roundSizeChoices } from "../lib/round.js";
import { useRound } from "../lib/useRound.js";

const GROUPS = [
  { key: "mix", label: "Mix — Tüm Kelimeler" },
  { key: "yokdil", label: "YÖKDİL Kelimeleri" },
  { key: "yds", label: "YDS Kelimeleri" },
];

const MAX_WRONG = 6;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function findBlank(word, sentence) {
  if (!word || !sentence) return null;
  const esc = word.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = sentence.match(new RegExp(`\\b${esc}\\w*`, "i"));
  if (!m) return null;
  return { pre: sentence.slice(0, m.index), matched: m[0], post: sentence.slice(m.index + m[0].length) };
}

export default function WordHangman() {
  const words = useStore((s) => s.words);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);

  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const round = useRound();
  const [guessed, setGuessed] = useState(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(null); // null | true | false

  const poolFor = (g) => (g === "mix" ? words : words.filter((w) => w.sourceType === g));

  useEffect(() => {
    setGuessed(new Set());
    setWrongCount(0);
    setDone(null);
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

  const letters = round.current ? round.current.word.toLowerCase().split("") : [];

  const tapLetter = (ch) => {
    if (done !== null || guessed.has(ch)) return;
    const next = new Set(guessed);
    next.add(ch);
    setGuessed(next);
    if (letters.includes(ch)) {
      const solved = letters.every((c) => !/[a-z]/.test(c) || next.has(c));
      if (solved) {
        setDone(true);
        recordWordAnswer(round.current.word, true);
      }
    } else {
      const wc = wrongCount + 1;
      setWrongCount(wc);
      if (wc >= MAX_WRONG) {
        setDone(false);
        recordWordAnswer(round.current.word, false);
      }
    }
  };

  const onNext = () => {
    round.answer(done === true);
  };

  const clue = round.current ? findBlank(round.current.word, round.current.example_en) : null;

  return (
    <div className="screen">
      {stage === "group" && (
        <>
          <header className="screen-head">
            <h1>Adam Asmaca</h1>
            <p className="muted">Anlam ve cümle ipucuna bakarak kelimeyi harf harf bul.</p>
          </header>
          {words.length === 0 ? (
            <div className="empty">
              <p>Henüz kelime yok.</p>
              <p className="muted">Soru çözerken kelimelere dokun; buraya düşsünler.</p>
            </div>
          ) : (
            <div className="list">
              <p className="muted" style={{ marginBottom: 12 }}>Hangi kelimelerle çalışmak istiyorsun?</p>
              {GROUPS.map((g) => {
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
            <button className="link" onClick={() => setStage("group")}>← Adam Asmaca</button>
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

      {stage === "play" && round.current && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Adam Asmaca</button>
            <span className="muted small">Kalan: {round.remaining} / {round.total}</span>
          </header>
          <div className="card game-card">
            <p className="muted small" style={{ marginBottom: 6 }}>{round.current.meaning_tr}</p>
            {clue && (
              <p className="muted small" style={{ marginBottom: 10 }}>
                {clue.pre}<span className="cloze-active-blank">______</span>{clue.post}
              </p>
            )}
            <div className="hangman-word">
              {letters.map((ch, i) =>
                /[a-z]/.test(ch) ? (
                  <span key={i} className="hangman-letter-box">
                    {guessed.has(ch) || done === false ? ch.toUpperCase() : ""}
                  </span>
                ) : (
                  <span key={i} className="hangman-letter-box hangman-space">{ch}</span>
                )
              )}
            </div>
            <p className="hangman-lives">Kalan hak: {MAX_WRONG - wrongCount}</p>
            <div className="hangman-keyboard">
              {ALPHABET.map((ch) => {
                let cls = "hangman-key";
                if (guessed.has(ch)) cls += letters.includes(ch) ? " used-correct" : " used-wrong";
                return (
                  <button key={ch} className={cls} disabled={guessed.has(ch) || done !== null} onClick={() => tapLetter(ch)}>
                    {ch.toUpperCase()}
                  </button>
                );
              })}
            </div>
            {done !== null && (
              <div className="reveal">
                <div className={"feedback " + (done ? "good" : "bad")}>
                  {done ? "✓ Doğru!" : `✗ Bilemedin. Doğrusu: ${round.current.word}`}
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
            <button className="link" onClick={() => setStage("group")}>← Adam Asmaca</button>
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
