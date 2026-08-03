import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DIGER_SEED_WORDS } from "./lib/digerSeedWords.js";
import { shuffle } from "./lib/round.js";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const emptyStats = () => ({ seen: 0, correct: 0 });

const makeDigerSeedWords = () =>
  DIGER_SEED_WORDS.map((w) => ({ ...w, sourceType: "diger", stats: emptyStats(), addedAt: Date.now() }));

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
      denemes: [], // { id, name, type, createdAt, questions: [...] }
      addDeneme: (name, questions, type = "yokdil") => {
        const id = uid();
        const prepared = questions.map((q, i) => ({
          ...q,
          id: `q${q.number ?? i + 1}_${i}`,
          userAnswer: null,
        }));
        set((s) => ({
          denemes: [
            ...s.denemes,
            { id, name, type, createdAt: Date.now(), questions: prepared },
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
      setDenemeType: (id, type) =>
        set((s) => ({
          denemes: s.denemes.map((d) => (d.id === id ? { ...d, type } : d)),
        })),
      addDenemeTime: (id, deltaSeconds) =>
        set((s) => ({
          denemes: s.denemes.map((d) =>
            d.id === id ? { ...d, timeSpent: (d.timeSpent || 0) + deltaSeconds } : d
          ),
        })),
      addQuestionTime: (denemeId, questionId, deltaSeconds) =>
        set((s) => ({
          denemes: s.denemes.map((d) =>
            d.id !== denemeId
              ? d
              : {
                  ...d,
                  questions: d.questions.map((q) =>
                    q.id === questionId ? { ...q, timeSpent: (q.timeSpent || 0) + deltaSeconds } : q
                  ),
                }
          ),
        })),
      updateDenemeQuestions: (id, newQuestions) => {
        const deneme = get().denemes.find((d) => d.id === id);
        if (!deneme) return 0;
        const existingByNumber = Object.fromEntries(
          deneme.questions.map((q) => [q.number, q])
        );
        const merged = newQuestions.map((nq, i) => {
          const old = existingByNumber[nq.number];
          return {
            ...nq,
            id: old ? old.id : `q${nq.number ?? i + 1}_${i}`,
            userAnswer: old ? old.userAnswer : null,
          };
        });
        const mergedByNumber = Object.fromEntries(merged.map((q) => [q.number, q]));
        set((s) => ({
          denemes: s.denemes.map((d) =>
            d.id === id ? { ...d, questions: merged } : d
          ),
          // Yanlış soruların snapshot'ını da güncelle (passage vb. düzelsin)
          wrongQuestions: s.wrongQuestions.map((w) => {
            if (w.denemeId !== id) return w;
            const fresh = mergedByNumber[w.question.number];
            if (!fresh) return w;
            return { ...w, question: { ...fresh, userAnswer: w.question.userAnswer } };
          }),
        }));
        return merged.length;
      },

      retakeDeneme: (id) => {
        const deneme = get().denemes.find((d) => d.id === id);
        if (!deneme) return;
        const total = deneme.questions.length;
        const correct = deneme.questions.filter((q) => q.userAnswer === q.answer).length;
        const answered = deneme.questions.filter((q) => q.userAnswer).length;
        const wrong = answered - correct;
        const attemptSnapshot = {
          date: Date.now(),
          total,
          correct,
          wrong,
          unanswered: total - answered,
          score: +(correct * 1.25).toFixed(2),
          timeSpent: deneme.timeSpent || 0,
        };
        set((s) => ({
          denemes: s.denemes.map((d) =>
            d.id !== id
              ? d
              : {
                  ...d,
                  pastAttempts: answered > 0 ? [...(d.pastAttempts || []), attemptSnapshot] : d.pastAttempts || [],
                  timeSpent: 0,
                  questions: d.questions.map((q) => ({ ...q, userAnswer: null, timeSpent: 0 })),
                }
          ),
        }));
      },

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
      wrongQuestions: [],
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
      setWrongNote: (wrongId, note) =>
        set((s) => ({
          wrongQuestions: s.wrongQuestions.map((w) =>
            w.id === wrongId ? { ...w, note } : w
          ),
        })),

      // --- Kalıp Quiz istatistikleri (phrasal/prep/gerund/collocation) ---
      patternStats: {}, // { [key]: { seen, correct } }
      recordPatternAnswer: (key, correct) =>
        set((s) => {
          const prev = s.patternStats[key] || emptyStats();
          return {
            patternStats: {
              ...s.patternStats,
              [key]: { seen: prev.seen + 1, correct: prev.correct + (correct ? 1 : 0) },
            },
          };
        }),

      // --- Sınav tipi oyunları istatistikleri (Cümle Tamamlama, Anlam Bütünlüğü vb.) ---
      examStats: {}, // { [key]: { seen, correct } }
      recordExamAnswer: (key, correct) =>
        set((s) => {
          const prev = s.examStats[key] || emptyStats();
          return {
            examStats: {
              ...s.examStats,
              [key]: { seen: prev.seen + 1, correct: prev.correct + (correct ? 1 : 0) },
            },
          };
        }),

      // --- Kelimeler ---
      words: makeDigerSeedWords(),
      pendingWords: [],
      addPendingWord: (word, context, sourceType = null) => {
        const key = word.trim().toLowerCase();
        const alreadyKnown = get().words.some((w) => w.word.toLowerCase() === key);
        const alreadyPending = get().pendingWords.some((w) => w.word === key);
        if (alreadyKnown || alreadyPending) return false;
        set((s) => ({ pendingWords: [...s.pendingWords, { word: key, context, sourceType }] }));
        return true;
      },
      clearPendingWords: () => set({ pendingWords: [] }),
      removePendingWord: (word) =>
        set((s) => ({ pendingWords: s.pendingWords.filter((w) => w.word !== word) })),
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
      applyWordReformat: (fixed) => {
        const byWord = Object.fromEntries((fixed || []).map((f) => [f.word.toLowerCase(), f]));
        set((s) => ({
          words: s.words.map((w) => {
            const f = byWord[w.word.toLowerCase()];
            if (!f) return w;
            return { ...w, meaning_tr: f.meaning_tr, distractors_tr: f.distractors_tr };
          }),
        }));
      },
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

      // --- Günün Kelimeleri ---
      dailyWords: [], // güncel çekilen kelimeler (word string listesi)
      dailyWordsHistory: [], // bugüne kadar çekilmiş tüm kelimeler — bir kez çekilen kelime tekrar çekilmez
      pullDailyWords: (n, sourceTypes = ["mix"]) => {
        const s = get();
        const usedSet = new Set(s.dailyWordsHistory);
        const isMix = !sourceTypes || sourceTypes.length === 0 || sourceTypes.includes("mix");
        const pool = isMix ? s.words : s.words.filter((w) => sourceTypes.includes(w.sourceType));
        const available = shuffle(pool.filter((w) => !usedSet.has(w.word)));
        const picked = available.slice(0, n).map((w) => w.word);
        set({
          dailyWords: picked,
          dailyWordsHistory: [...s.dailyWordsHistory, ...picked],
        });
        return picked.length;
      },
      resetDailyWords: () =>
        set({ dailyWords: [], dailyWordsHistory: [] }),

      // --- AI Soru Havuzu ---
      aiPool: [], // { id, type, category, passage, text, options, answer, createdAt }
      addAIPoolQuestions: (type, category, questions) => {
        const prepared = questions.map((q) => ({
          id: uid(),
          type,
          category,
          passage: q.passage ?? null,
          text: q.text,
          options: q.options,
          answer: q.answer,
          createdAt: Date.now(),
        }));
        set((s) => ({ aiPool: [...s.aiPool, ...prepared] }));
        return prepared.length;
      },
      removeAIPoolQuestion: (id) =>
        set((s) => ({ aiPool: s.aiPool.filter((q) => q.id !== id) })),
      answerAIPoolQuestion: (id, letter) => {
        const q = get().aiPool.find((x) => x.id === id);
        if (!q) return false;
        const isCorrect = letter === q.answer;
        set((s) => ({ aiPool: s.aiPool.filter((x) => x.id !== id) }));
        if (!isCorrect) {
          set((s) => ({
            wrongQuestions: [
              ...s.wrongQuestions,
              {
                id: uid(),
                denemeId: null,
                questionId: q.id,
                denemeName: "AI Generated Question",
                category: q.category,
                question: { ...q, userAnswer: letter },
                explanation: null,
                stats: emptyStats(),
                addedAt: Date.now(),
              },
            ],
          }));
        }
        return isCorrect;
      },
    }),
    {
      name: "yokdil-store-v1",
      version: 5,
      migrate: (state, version) => {
        if (state?.settings) {
          const m = state.settings.model || "";
          if (!m || m.startsWith("claude")) {
            state.settings.model = "gemini-2.5-flash";
          }
          if ((state.settings.apiKey || "").startsWith("sk-ant")) {
            state.settings.apiKey = "";
          }
        }
        // v2 → v3: tüm mevcut denemelere type: "yokdil" ekle (cevaplar korunur)
        if (version < 3 && state?.denemes) {
          state.denemes = state.denemes.map((d) =>
            d.type ? d : { ...d, type: "yokdil" }
          );
        }
        // v3 → v4: AI soru havuzu eklendi
        if (version < 4 && state && !state.aiPool) {
          state.aiPool = [];
        }
        // v4 → v5: "Diğer" kategorisi tohum kelimelerini mevcut kelimelerle birleştir
        // (kullanıcının kendi eklediği kelimelerin üstüne yazmaz, sadece eksik olanları ekler)
        if (version < 5 && state) {
          const existing = new Set((state.words || []).map((w) => w.word.toLowerCase()));
          const toAdd = makeDigerSeedWords().filter((w) => !existing.has(w.word.toLowerCase()));
          state.words = [...(state.words || []), ...toAdd];
        }
        return state;
      },
    }
  )
);
