import { create } from "zustand";
import { persist } from "zustand/middleware";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const emptyStats = () => ({ seen: 0, correct: 0 });

export const useStore = create(
  persist(
    (set, get) => ({
      // --- Ayarlar ---
      settings: {
        apiKey: "",
        model: "gemini-2.5-flash",
      },
      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // --- Denemeler ---
      denemes: [], // { id, name, createdAt, questions: [...] }
      addDeneme: (name, questions) => {
        const id = uid();
        const prepared = questions.map((q, i) => ({
          ...q,
          id: `q${q.number ?? i + 1}_${i}`,
          userAnswer: null,
        }));
        set((s) => ({
          denemes: [
            ...s.denemes,
            { id, name, createdAt: Date.now(), questions: prepared },
          ],
        }));
        return id;
      },
      removeDeneme: (id) =>
        set((s) => ({
          denemes: s.denemes.filter((d) => d.id !== id),
          wrongQuestions: s.wrongQuestions.filter((w) => w.denemeId !== id),
        })),
      renameDeneme: (id, name) =>
        set((s) => ({
          denemes: s.denemes.map((d) => (d.id === id ? { ...d, name } : d)),
        })),

      // Bir soruyu cevapla. Doğru/yanlış döndürür ve yanlışsa yanlışlar paneline ekler.
      answerQuestion: (denemeId, questionId, letter) => {
        const deneme = get().denemes.find((d) => d.id === denemeId);
        if (!deneme) return false;
        const q = deneme.questions.find((x) => x.id === questionId);
        if (!q) return false;
        const isCorrect = letter === q.answer;

        set((s) => ({
          denemes: s.denemes.map((d) =>
            d.id !== denemeId
              ? d
              : {
                  ...d,
                  questions: d.questions.map((x) =>
                    x.id === questionId ? { ...x, userAnswer: letter } : x
                  ),
                }
          ),
        }));

        if (!isCorrect) {
          const exists = get().wrongQuestions.find(
            (w) => w.denemeId === denemeId && w.questionId === questionId
          );
          if (!exists) {
            set((s) => ({
              wrongQuestions: [
                ...s.wrongQuestions,
                {
                  id: uid(),
                  denemeId,
                  questionId,
                  denemeName: deneme.name,
                  question: { ...q, userAnswer: letter },
                  explanation: null,
                  stats: emptyStats(),
                  addedAt: Date.now(),
                },
              ],
            }));
          }
        }
        return isCorrect;
      },

      // --- Yanlış sorular ---
      wrongQuestions: [], // { id, denemeId, questionId, question, explanation, stats }
      setExplanation: (wrongId, text) =>
        set((s) => ({
          wrongQuestions: s.wrongQuestions.map((w) =>
            w.id === wrongId ? { ...w, explanation: text } : w
          ),
        })),
      recordReview: (wrongId, correct) =>
        set((s) => ({
          wrongQuestions: s.wrongQuestions.map((w) =>
            w.id === wrongId
              ? {
                  ...w,
                  stats: {
                    seen: w.stats.seen + 1,
                    correct: w.stats.correct + (correct ? 1 : 0),
                  },
                }
              : w
          ),
        })),
      removeWrong: (wrongId) =>
        set((s) => ({
          wrongQuestions: s.wrongQuestions.filter((w) => w.id !== wrongId),
        })),

      // --- Kelimeler ---
      words: [], // { word, meaning_tr, pos, example_en, example_tr, distractors_tr, stats, addedAt }
      pendingWords: [], // { word, context } — analiz bekleniyor
      addPendingWord: (word, context) => {
        const key = word.trim().toLowerCase();
        const alreadyKnown = get().words.some((w) => w.word.toLowerCase() === key);
        const alreadyPending = get().pendingWords.some((w) => w.word === key);
        if (alreadyKnown || alreadyPending) return false;
        set((s) => ({ pendingWords: [...s.pendingWords, { word: key, context }] }));
        return true;
      },
      clearPendingWords: () => set({ pendingWords: [] }),
      addWord: (wordObj) => {
        const key = wordObj.word.trim().toLowerCase();
        const exists = get().words.find((w) => w.word.toLowerCase() === key);
        if (exists) return false;
        set((s) => ({
          words: [...s.words, { ...wordObj, stats: emptyStats(), addedAt: Date.now() }],
        }));
        return true;
      },
      recordWordAnswer: (word, correct) =>
        set((s) => ({
          words: s.words.map((w) =>
            w.word === word
              ? {
                  ...w,
                  stats: {
                    seen: w.stats.seen + 1,
                    correct: w.stats.correct + (correct ? 1 : 0),
                  },
                }
              : w
          ),
        })),
      removeWord: (word) =>
        set((s) => ({ words: s.words.filter((w) => w.word !== word) })),
      importWords: (incoming) => {
        const existingKeys = new Set(get().words.map((w) => w.word.toLowerCase()));
        const toAdd = (incoming || []).filter(
          (w) => w.word && !existingKeys.has(w.word.toLowerCase())
        );
        set((s) => ({
          words: [
            ...s.words,
            ...toAdd.map((w) => ({ ...w, stats: w.stats || emptyStats(), addedAt: w.addedAt || Date.now() })),
          ],
        }));
        return toAdd.length;
      },
      importWrongQuestions: (incoming) => {
        const existingIds = new Set(get().wrongQuestions.map((w) => w.id));
        const toAdd = (incoming || []).filter((w) => w.id && !existingIds.has(w.id));
        set((s) => ({ wrongQuestions: [...s.wrongQuestions, ...toAdd] }));
        return toAdd.length;
      },
    }),
    {
      name: "yokdil-store-v1",
      version: 2,
      migrate: (state, version) => {
        // Gemini'ye geçiş: eski Claude modeli/anahtarı seçiliyse sıfırla.
        if (state?.settings) {
          const m = state.settings.model || "";
          if (!m || m.startsWith("claude")) {
            state.settings.model = "gemini-2.5-flash";
          }
          if ((state.settings.apiKey || "").startsWith("sk-ant")) {
            state.settings.apiKey = "";
          }
        }
        return state;
      },
    }
  )
);
