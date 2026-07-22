import { YOKDIL_FEN_WORDS, YDS_ACADEMIC_WORDS } from "./academicWords.js";

const emptyStats = { seen: 0, correct: 0 };

// Kullanıcının kendi topladığı kelimeler ile sabit akademik kelime veritabanlarını
// tüm kelime oyunlarında aynı arayüzle (key/label/pool/kind) sunar.
// kind "user" -> recordWordAnswer, kind "academic" -> recordAcademicWordAnswer ile puanlanır.
export function buildWordGroups(words, academicWordStats) {
  const withStats = (list) => list.map((w) => ({ ...w, stats: academicWordStats[w.word] || emptyStats }));
  return [
    { key: "mix", label: "Mix — Tüm Kelimeler", pool: words, kind: "user" },
    { key: "yokdil", label: "YÖKDİL Kelimeleri", pool: words.filter((w) => w.sourceType === "yokdil"), kind: "user" },
    { key: "yds", label: "YDS Kelimeleri", pool: words.filter((w) => w.sourceType === "yds"), kind: "user" },
    { key: "academic-fen", label: "YÖKDİL Fen — Akademik Kelimeler", pool: withStats(YOKDIL_FEN_WORDS), kind: "academic" },
    { key: "academic-yds", label: "YDS — Akademik Kelimeler", pool: withStats(YDS_ACADEMIC_WORDS), kind: "academic" },
  ];
}
