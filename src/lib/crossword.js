import { shuffle } from "./round.js";

const CANVAS = 21; // large working canvas, trimmed to bounding box afterward

function canPlace(grid, word, row, col, dir) {
  const len = word.length;
  if (dir === "h") {
    if (col < 0 || col + len > CANVAS || row < 0 || row >= CANVAS) return false;
    if (col - 1 >= 0 && grid[row][col - 1]) return false;
    if (col + len < CANVAS && grid[row][col + len]) return false;
    for (let i = 0; i < len; i++) {
      const cell = grid[row][col + i];
      if (cell && cell.ch !== word[i]) return false;
      if (!cell) {
        if (row - 1 >= 0 && grid[row - 1][col + i]) return false;
        if (row + 1 < CANVAS && grid[row + 1][col + i]) return false;
      }
    }
    return true;
  }
  if (row < 0 || row + len > CANVAS || col < 0 || col >= CANVAS) return false;
  if (row - 1 >= 0 && grid[row - 1][col]) return false;
  if (row + len < CANVAS && grid[row + len][col]) return false;
  for (let i = 0; i < len; i++) {
    const cell = grid[row + i][col];
    if (cell && cell.ch !== word[i]) return false;
    if (!cell) {
      if (col - 1 >= 0 && grid[row + i][col - 1]) return false;
      if (col + 1 < CANVAS && grid[row + i][col + 1]) return false;
    }
  }
  return true;
}

function place(grid, placed, wordObj, row, col, dir) {
  const word = wordObj.word.toLowerCase();
  for (let i = 0; i < word.length; i++) {
    const r = dir === "h" ? row : row + i;
    const c = dir === "h" ? col + i : col;
    grid[r][c] = grid[r][c] || { ch: word[i] };
  }
  placed.push({ word: wordObj.word, meaning_tr: wordObj.meaning_tr, pos: wordObj.pos, row, col, dir, length: word.length });
}

// Builds a crossword from a word pool. Returns { entries, grid, rows, cols } or null if nothing could be placed.
export function buildCrossword(pool, targetCount) {
  const candidates = shuffle(
    pool.filter((w) => /^[a-z]+$/i.test(w.word) && w.word.length >= 3 && w.word.length <= 12)
  );
  if (candidates.length === 0) return null;

  const grid = Array.from({ length: CANVAS }, () => Array(CANVAS).fill(null));
  const placed = [];

  const first = candidates[0];
  const firstWord = first.word.toLowerCase();
  const startRow = Math.floor(CANVAS / 2);
  const startCol = Math.floor((CANVAS - firstWord.length) / 2);
  place(grid, placed, first, startRow, startCol, "h");

  for (let i = 1; i < candidates.length && placed.length < targetCount; i++) {
    const cand = candidates[i];
    const w = cand.word.toLowerCase();
    let best = null;
    outer: for (const p of placed) {
      const pw = p.word.toLowerCase();
      for (let pi = 0; pi < pw.length; pi++) {
        for (let wi = 0; wi < w.length; wi++) {
          if (pw[pi] !== w[wi]) continue;
          const newDir = p.dir === "h" ? "v" : "h";
          const row = p.dir === "h" ? p.row - wi : p.row + pi;
          const col = p.dir === "h" ? p.col + pi : p.col - wi;
          if (canPlace(grid, w, row, col, newDir)) {
            best = { row, col, dir: newDir };
            break outer;
          }
        }
      }
    }
    if (best) place(grid, placed, cand, best.row, best.col, best.dir);
  }

  if (placed.length === 0) return null;

  let minRow = CANVAS, maxRow = -1, minCol = CANVAS, maxCol = -1;
  for (let r = 0; r < CANVAS; r++) {
    for (let c = 0; c < CANVAS; c++) {
      if (grid[r][c]) {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    }
  }
  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;

  const entries = placed.map((p) => ({ ...p, row: p.row - minRow, col: p.col - minCol }));

  const startCells = new Map();
  entries.forEach((e) => startCells.set(`${e.row},${e.col}`, { row: e.row, col: e.col }));
  const sortedStarts = [...startCells.values()].sort((a, b) => a.row - b.row || a.col - b.col);
  const numberOf = new Map();
  sortedStarts.forEach((c, i) => numberOf.set(`${c.row},${c.col}`, i + 1));
  entries.forEach((e) => { e.number = numberOf.get(`${e.row},${e.col}`); });

  const trimmedGrid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => grid[r + minRow][c + minCol])
  );

  return { entries, grid: trimmedGrid, rows, cols };
}
