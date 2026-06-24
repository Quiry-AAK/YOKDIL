// Aralıklı tekrar (spaced repetition) ağırlık mantığı.
// Amaç: sık görüp doğru yaptığın öğeler daha az; yanlış yaptıkların daha çok çıksın.

export function srWeight(stats) {
  const seen = stats?.seen ?? 0;
  const correct = stats?.correct ?? 0;
  const wrong = Math.max(0, seen - correct);
  // Her doğru cevap ağırlığı yarıdan biraz fazla düşürür; her yanlış artırır.
  const weight = Math.pow(0.45, correct) * (1 + wrong);
  return Math.max(0.04, weight);
}

// Verilen listeden ağırlıklı rastgele bir öğe seç.
export function pickWeighted(items, statsOf) {
  if (!items || items.length === 0) return null;
  const weights = items.map((it) => srWeight(statsOf(it)));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// Diziyi karıştır (Fisher-Yates).
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
