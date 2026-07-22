import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store.js";
import { shuffle, pickLeastSeen } from "../lib/round.js";
import { buildWordGroups } from "../lib/wordSources.js";

function linkSizeChoices(poolLength) {
  const opts = [6, 8, 10, 12].filter((n) => n <= poolLength);
  return opts.length ? opts : poolLength >= 2 ? [poolLength] : [];
}

export default function WordLink() {
  const words = useStore((s) => s.words);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const academicWordStats = useStore((s) => s.academicWordStats);
  const recordAcademicWordAnswer = useStore((s) => s.recordAcademicWordAnswer);
  const groups = useMemo(() => buildWordGroups(words, academicWordStats), [words, academicWordStats]);

  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [active, setActive] = useState(null); // { side, key }
  const [wrongPair, setWrongPair] = useState([]); // [leftKey, rightKey]
  const [attempts, setAttempts] = useState(0);

  const poolFor = (key) => groups.find((g) => g.key === key)?.pool ?? [];
  const activeKind = groups.find((g) => g.key === group)?.kind;
  const recordAnswer = (word, correct) => {
    if (activeKind === "academic") recordAcademicWordAnswer(word, correct);
    else recordWordAnswer(word, correct);
  };

  const startGroup = (g) => {
    setGroup(g);
    setStage("size");
  };

  const startRound = (n) => {
    const picked = pickLeastSeen(poolFor(group), (w) => w.stats, n);
    setLeftItems(shuffle(picked.map((w) => ({ key: w.word, text: w.word }))));
    setRightItems(shuffle(picked.map((w) => ({ key: w.word, text: w.meaning_tr }))));
    setMatched(new Set());
    setActive(null);
    setWrongPair([]);
    setAttempts(0);
    setStage("play");
  };

  const totalPairs = leftItems.length;

  useEffect(() => {
    if (stage === "play" && totalPairs > 0 && matched.size === totalPairs) setStage("score");
  }, [matched, stage, totalPairs]);

  const attemptMatch = (leftKey, rightKey) => {
    setAttempts((a) => a + 1);
    if (leftKey === rightKey) {
      recordAnswer(leftKey, true);
      setMatched((prev) => new Set(prev).add(leftKey));
      setActive(null);
    } else {
      setWrongPair([leftKey, rightKey]);
      setTimeout(() => { setWrongPair([]); setActive(null); }, 500);
    }
  };

  const tapItem = (side, key) => {
    if (matched.has(key)) return;
    if (wrongPair.length) return;
    if (!active) { setActive({ side, key }); return; }
    if (active.side === side) { setActive({ side, key }); return; }
    if (side === "left") attemptMatch(key, active.key);
    else attemptMatch(active.key, key);
  };

  return (
    <div className="screen">
      {stage === "group" && (
        <>
          <header className="screen-head">
            <h1>Sütun Eşleştirme</h1>
            <p className="muted">Solda İngilizce kelimeler, sağda Türkçe anlamları — doğru çiftleri bul.</p>
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
            <button className="link" onClick={() => setStage("group")}>← Sütun Eşleştirme</button>
          </header>
          <p className="muted" style={{ marginBottom: 12 }}>Kaç çift ile oynamak istiyorsun?</p>
          <div className="list">
            {linkSizeChoices(poolFor(group).length).map((n) => (
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
            <button className="link" onClick={() => setStage("group")}>← Sütun Eşleştirme</button>
            <span className="muted small">Eşleşen: {matched.size} / {totalPairs} · Deneme: {attempts}</span>
          </header>
          <div className="link-columns">
            <div className="link-col">
              {leftItems.map((it) => {
                const isMatched = matched.has(it.key);
                let cls = "link-item";
                if (isMatched) cls += " matched";
                else if (active?.side === "left" && active.key === it.key) cls += " selected";
                if (wrongPair[0] === it.key) cls += " wrong";
                return (
                  <button key={it.key} className={cls} data-wordkey={it.key} data-side="left" disabled={isMatched} onClick={() => tapItem("left", it.key)}>
                    {it.text}
                  </button>
                );
              })}
            </div>
            <div className="link-col">
              {rightItems.map((it, i) => {
                const isMatched = matched.has(it.key);
                let cls = "link-item";
                if (isMatched) cls += " matched";
                else if (active?.side === "right" && active.key === it.key) cls += " selected";
                if (wrongPair[1] === it.key) cls += " wrong";
                return (
                  <button key={`${it.key}-r${i}`} className={cls} data-wordkey={it.key} data-side="right" disabled={isMatched} onClick={() => tapItem("right", it.key)}>
                    {it.text}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {stage === "score" && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Sütun Eşleştirme</button>
          </header>
          <div className="card score-card">
            <div className="score-big">%{attempts ? Math.round((totalPairs / attempts) * 100) : 100}</div>
            <p className="muted small" style={{ margin: "-12px 0 16px" }}>verimlilik (çift / deneme)</p>
            <div className="score-row"><span className="score-label">Çift sayısı</span><span className="score-val">{totalPairs}</span></div>
            <div className="score-row"><span className="score-label">Toplam deneme</span><span className="score-val">{attempts}</span></div>
            <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => setStage("size")}>Yeni Tur</button>
          </div>
        </>
      )}
    </div>
  );
}
