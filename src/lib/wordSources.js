// Kullanıcının kendi topladığı kelimeleri (words store) YÖKDİL / YDS / Diğer
// etiketlerine göre gruplar. Tüm kelime oyunlarında aynı arayüzle (key/label/pool) kullanılır.
export function buildWordGroups(words) {
  return [
    { key: "mix", label: "Mix — Tüm Kelimeler", pool: words },
    { key: "yokdil", label: "YÖKDİL Kelimeleri", pool: words.filter((w) => w.sourceType === "yokdil") },
    { key: "yds", label: "YDS Kelimeleri", pool: words.filter((w) => w.sourceType === "yds") },
    { key: "diger", label: "Diğer Kelimeler", pool: words.filter((w) => w.sourceType === "diger") },
  ];
}
