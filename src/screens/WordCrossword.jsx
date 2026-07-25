import { useState, useMemo } from "react";
import { useStore } from "../store.js";
import { pickLeastSeen } from "../lib/round.js";
import { buildCrossword } from "../lib/crossword.js";
import { buildWordGroups } from "../lib/wordSources.js";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function crosswordSizeChoices(poolLength) {
  const opts = [6, 8, 10, 12].filter((n) => n <= poolLength);
  return opts.length ? opts : poolLength >= 3 ? [poolLength] : [];
}

function filterValid(pool) {
  return pool.filter((w) => /^[a-z]+$/i.test(w.word) && w.word.length >= 3 && w.word.length <= 12);
}

export default function WordCrossword() {
  const words = useStore((s) => s.words);
  const dailyWords = useStore((s) => s.dailyWords);
  const dailyWordsHistory = useStore((s) => s.dailyWordsHistory);
  const recordWordAnswer = useStore((s) => s.recordWordAnswer);
  const groups = useMemo(() => buildWordGroups(words, dailyWords, dailyWordsHistory), [words, dailyWords, dailyWordsHistory]);

  const [stage, setStage] = useState("group"); // group | size | play | score
  const [group, setGroup] = useState(null);
  const [puzzle, setPuzzle] = useState(null); // { entries, grid, rows, cols }
  const [userLetters, setUserLetters] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [cursor, setCursor] = useState(null); // {r,c}
  const [checkResults, setCheckResults] = useState({});
  const [checkCount, setCheckCount] = useState(0);
  const [genError, setGenError] = useState(false);
  const [lastN, setLastN] = useState(null);

  const poolFor = (key) => filterValid(groups.find((g) => g.key === key)?.pool ?? []);

  const startGroup = (g) => { setGroup(g); setStage("size"); };

  const startRound = (n) => {
    setLastN(n);
    const pool = poolFor(group);
    const sampleSize = Math.min(pool.length, Math.max(n * 5, 20));
    const sample = pickLeastSeen(pool, (w) => w.stats, sampleSize);
    const built = buildCrossword(sample, n);
    if (!built || built.entries.length < 2) { setGenError(true); return; }
    setGenError(false);
    setPuzzle(built);
    setUserLetters({});
    setCheckResults({});
    setCheckCount(0);
    setActiveIdx(0);
    const first = built.entries[0];
    setCursor({ r: first.row, c: first.col });
    setStage("play");
  };

  const activeEntry = puzzle?.entries?.[activeIdx] ?? null;

  const activeCells = useMemo(() => {
    const s = new Set();
    if (!activeEntry) return s;
    for (let i = 0; i < activeEntry.length; i++) {
      const r = activeEntry.dir === "h" ? activeEntry.row : activeEntry.row + i;
      const c = activeEntry.dir === "h" ? activeEntry.col + i : activeEntry.col;
      s.add(`${r},${c}`);
    }
    return s;
  }, [activeEntry]);

  const numberMap = useMemo(() => {
    const m = {};
    if (puzzle) puzzle.entries.forEach((e) => { m[`${e.row},${e.col}`] = e.number; });
    return m;
  }, [puzzle]);

  const cellEntries = (r, c) => {
    if (!puzzle) return [];
    return puzzle.entries.filter((e) => {
      if (e.dir === "h") return e.row === r && c >= e.col && c < e.col + e.length;
      return e.col === c && r >= e.row && r < e.row + e.length;
    });
  };

  const selectEntry = (idx) => {
    const e = puzzle.entries[idx];
    setActiveIdx(idx);
    let target = { r: e.row, c: e.col };
    for (let i = 0; i < e.length; i++) {
      const r = e.dir === "h" ? e.row : e.row + i;
      const c = e.dir === "h" ? e.col + i : e.col;
      if (!userLetters[`${r},${c}`]) { target = { r, c }; break; }
    }
    setCursor(target);
  };

  const tapCell = (r, c) => {
    const owners = cellEntries(r, c);
    if (owners.length === 0) return;
    let entry = owners.find((e) => e === activeEntry);
    if (!entry) entry = owners[0];
    setActiveIdx(puzzle.entries.indexOf(entry));
    setCursor({ r, c });
  };

  const advanceCursor = (entry, from) => {
    if (!entry || !from) return;
    const idx = entry.dir === "h" ? from.c - entry.col : from.r - entry.row;
    const nextIdx = idx + 1;
    if (nextIdx < entry.length) {
      const r = entry.dir === "h" ? entry.row : entry.row + nextIdx;
      const c = entry.dir === "h" ? entry.col + nextIdx : entry.col;
      setCursor({ r, c });
    }
  };

  const typeLetter = (ch) => {
    if (!cursor) return;
    const key = `${cursor.r},${cursor.c}`;
    setUserLetters((prev) => ({ ...prev, [key]: ch }));
    advanceCursor(activeEntry, cursor);
  };

  const backspace = () => {
    if (!cursor || !activeEntry) return;
    const key = `${cursor.r},${cursor.c}`;
    if (userLetters[key]) {
      setUserLetters((prev) => { const n = { ...prev }; delete n[key]; return n; });
      return;
    }
    const idx = activeEntry.dir === "h" ? cursor.c - activeEntry.col : cursor.r - activeEntry.row;
    if (idx > 0) {
      const prevIdx = idx - 1;
      const r = activeEntry.dir === "h" ? activeEntry.row : activeEntry.row + prevIdx;
      const c = activeEntry.dir === "h" ? activeEntry.col + prevIdx : activeEntry.col;
      setCursor({ r, c });
      setUserLetters((prev) => { const n = { ...prev }; delete n[`${r},${c}`]; return n; });
    }
  };

  const onCheck = () => {
    const results = {};
    let allCorrect = true;
    let anyFilled = false;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const cell = puzzle.grid[r][c];
        if (!cell) continue;
        const key = `${r},${c}`;
        const typed = userLetters[key];
        if (!typed) { allCorrect = false; continue; }
        anyFilled = true;
        const ok = typed.toLowerCase() === cell.ch.toLowerCase();
        results[key] = ok ? "correct" : "wrong";
        if (!ok) allCorrect = false;
      }
    }
    setCheckResults(results);
    setCheckCount((n) => n + 1);
    if (allCorrect && anyFilled) {
      puzzle.entries.forEach((e) => recordWordAnswer(e.word, true));
      setStage("score");
    }
  };

  return (
    <div className="screen">
      {stage === "group" && (
        <>
          <header className="screen-head">
            <h1>Çapraz Bulmaca</h1>
            <p className="muted">İpucu Türkçe anlam, cevap İngilizce kelime.</p>
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
                    className={"card cat-pick-card" + (count < 3 ? " disabled" : "")}
                    onClick={() => count >= 3 && startGroup(g.key)}
                  >
                    <div className="cat-pick-label">{g.label}</div>
                    <div className="cat-pick-sub muted small">{count} uygun kelime</div>
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
            <button className="link" onClick={() => setStage("group")}>← Çapraz Bulmaca</button>
          </header>
          <p className="muted" style={{ marginBottom: 12 }}>Kaç kelimelik bulmaca istiyorsun?</p>
          {genError && (
            <p className="muted small" style={{ color: "var(--bad)", marginBottom: 10 }}>
              Bu kadar kelime yerleştirilemedi, tekrar dene ya da daha az kelime seç.
            </p>
          )}
          <div className="list">
            {crosswordSizeChoices(poolFor(group).length).map((n) => (
              <div key={n} className="card cat-pick-card" onClick={() => startRound(n)}>
                <div className="cat-pick-label">{n} kelime</div>
              </div>
            ))}
          </div>
        </>
      )}

      {stage === "play" && puzzle && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Çapraz Bulmaca</button>
            <span className="muted small">{puzzle.entries.length} kelime</span>
          </header>

          <div className="xw-grid" style={{ gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)` }}>
            {puzzle.grid.flatMap((rowArr, r) =>
              rowArr.map((cell, c) => {
                const key = `${r},${c}`;
                if (!cell) return <div key={key} className="xw-cell xw-cell-empty" />;
                const num = numberMap[key];
                const letter = userLetters[key];
                const status = checkResults[key];
                let cls = "xw-cell";
                if (activeCells.has(key)) cls += " active";
                if (cursor && cursor.r === r && cursor.c === c) cls += " cursor";
                if (status === "correct") cls += " correct";
                if (status === "wrong") cls += " wrong";
                return (
                  <button key={key} className={cls} onClick={() => tapCell(r, c)}>
                    {num && <span className="xw-num">{num}</span>}
                    <span className="xw-letter">{letter ? letter.toUpperCase() : ""}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="xw-clues">
            <div className="xw-clue-col">
              <p className="xw-clue-head">Yatay</p>
              {puzzle.entries.filter((e) => e.dir === "h").sort((a, b) => a.number - b.number).map((e) => (
                <div
                  key={`h${e.number}`}
                  className={"xw-clue" + (e === activeEntry ? " active" : "")}
                  onClick={() => selectEntry(puzzle.entries.indexOf(e))}
                >
                  <span className="xw-clue-num">{e.number}.</span> {e.meaning_tr}
                </div>
              ))}
            </div>
            <div className="xw-clue-col">
              <p className="xw-clue-head">Dikey</p>
              {puzzle.entries.filter((e) => e.dir === "v").sort((a, b) => a.number - b.number).map((e) => (
                <div
                  key={`v${e.number}`}
                  className={"xw-clue" + (e === activeEntry ? " active" : "")}
                  onClick={() => selectEntry(puzzle.entries.indexOf(e))}
                >
                  <span className="xw-clue-num">{e.number}.</span> {e.meaning_tr}
                </div>
              ))}
            </div>
          </div>

          <div className="hangman-keyboard" style={{ marginTop: 12 }}>
            {ALPHABET.map((ch) => (
              <button key={ch} className="hangman-key" onClick={() => typeLetter(ch)}>{ch.toUpperCase()}</button>
            ))}
            <button className="hangman-key xw-backspace" onClick={backspace}>⌫</button>
          </div>

          <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={onCheck}>Kontrol Et</button>
        </>
      )}

      {stage === "score" && puzzle && (
        <>
          <header className="screen-head solve-head">
            <button className="link" onClick={() => setStage("group")}>← Çapraz Bulmaca</button>
          </header>
          <div className="card score-card">
            <div className="score-big">🎉</div>
            <p className="muted small" style={{ margin: "-12px 0 16px" }}>Bulmacayı tamamladın!</p>
            <div className="score-row"><span className="score-label">Kelime sayısı</span><span className="score-val">{puzzle.entries.length}</span></div>
            <div className="score-row"><span className="score-label">Kontrol sayısı</span><span className="score-val">{checkCount}</span></div>
            <button className="btn btn-primary btn-big" style={{ marginTop: 16 }} onClick={() => lastN && startRound(lastN)}>Yeni Bulmaca</button>
          </div>
        </>
      )}
    </div>
  );
}
