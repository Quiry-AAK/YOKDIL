// Kullanıcının kendi topladığı kelimeleri (words store) YÖKDİL / YDS / Diğer / Günün
// Kelimeleri etiketlerine göre gruplar. Tüm kelime oyunlarında aynı arayüzle (key/label/pool) kullanılır.
export function buildWordGroups(words, dailyWords = [], dailyWordsHistory = []) {
  const dailySet = new Set(dailyWords);
  const historySet = new Set(dailyWordsHistory);
  return [
    { key: "mix", label: "Mix — Tüm Kelimeler", pool: words },
    { key: "yokdil", label: "YÖKDİL Kelimeleri", pool: words.filter((w) => w.sourceType === "yokdil") },
    { key: "yds", label: "YDS Kelimeleri", pool: words.filter((w) => w.sourceType === "yds") },
    { key: "diger", label: "Diğer Kelimeler", pool: words.filter((w) => w.sourceType === "diger") },
    { key: "daily", label: "Günün Kelimeleri", pool: words.filter((w) => dailySet.has(w.word)) },
    { key: "daily-history", label: "Bugüne Kadarki Kelimeler", pool: words.filter((w) => historySet.has(w.word)) },
  ];
}
