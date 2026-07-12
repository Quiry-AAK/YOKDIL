export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// En az görülen (seen değeri en düşük) n öğeyi seçip karıştırır.
export function pickLeastSeen(items, statsOf, n) {
  const sorted = [...items].sort((a, b) => (statsOf(a)?.seen ?? 0) - (statsOf(b)?.seen ?? 0));
  return shuffle(sorted.slice(0, Math.min(n, sorted.length)));
}

const SIZE_STEPS = [10, 20, 50, 100];

// Havuz büyüklüğüne göre tur boyutu seçenekleri üretir (10/20/50/100 + Tümü).
export function roundSizeChoices(poolLength) {
  const choices = SIZE_STEPS.filter((n) => n < poolLength);
  if (poolLength > 0) choices.push(poolLength);
  return choices;
}
