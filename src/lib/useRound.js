import { useRef, useState } from "react";
import { shuffle } from "./round.js";

// Tur mantığı: yanlış cevaplanan öğe turun sonuna eklenir, doğru cevaplanan
// öğe turdan çıkar. Tur, tüm öğeler en az bir kez doğru cevaplanınca biter.
// Tur puanı = ilk denemede doğru bilinen öğe oranı.
export function useRound() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [total, setTotal] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const attemptedRef = useRef(new Set());
  const keyOfRef = useRef(() => null);

  const start = (items, keyOf) => {
    keyOfRef.current = keyOf;
    attemptedRef.current = new Set();
    const shuffled = shuffle(items);
    setCurrent(shuffled[0] ?? null);
    setQueue(shuffled.slice(1));
    setTotal(items.length);
    setFirstTryCorrect(0);
    setFinished(items.length === 0);
  };

  const answer = (isCorrect) => {
    if (!current) return;
    const key = keyOfRef.current(current);
    if (!attemptedRef.current.has(key)) {
      attemptedRef.current.add(key);
      if (isCorrect) setFirstTryCorrect((c) => c + 1);
    }
    if (isCorrect) {
      const nextCurrent = queue[0] ?? null;
      setCurrent(nextCurrent);
      setQueue(queue.slice(1));
      if (!nextCurrent) setFinished(true);
    } else {
      // Öğeyi yeni bir referansla kuyruğa geri koy — aksi hâlde tek öğe kalıp
      // yanlış cevaplandığında setCurrent aynı referansı alır, React state
      // güncellemesini es geçer (bailout) ve ekran donar.
      const requeued = { ...current };
      const newQueue = [...queue, requeued];
      setCurrent(newQueue[0]);
      setQueue(newQueue.slice(1));
    }
  };

  return {
    current,
    total,
    firstTryCorrect,
    finished,
    remaining: queue.length + (current ? 1 : 0),
    start,
    answer,
  };
}
