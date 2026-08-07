import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DIGER_SEED_WORDS } from "./lib/digerSeedWords.js";
import { shuffle } from "./lib/round.js";
import { getCategory, YOKDIL_CATS, YDS_CATS } from "./lib/categories.js";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const emptyStats = () => ({ seen: 0, correct: 0 });

const catsFor = (type) => (type === "yds" ? YDS_CATS : YOKDIL_CATS);

const denemeIndexOf = (denemes, denemeId) => {
  const i = denemes.findIndex((d) => d.id === denemeId);
  return i === -1 ? denemes.length : i;
};

// Bir kategoriye ait, tüm ilgili formattaki denemelerdeki (doğru/yanlış fark
// etmeksizin) tüm sorular — rastgele doldurma için kullanılan tam havuz.
const poolForCategory = (denemes, type, cat) => {
  const seen = new Set();
  const out = [];
  denemes.filter((d) => d.type === type).forEach((d) => {
    d.questions.forEach((q) => {
      if (getCategory(q.number, type) !== cat.label) return;
      const key = `${d.id}:${q.number}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ denemeId: d.id, question: q });
    });
  });
  return out;
};

// Bir kategoriye ait yanlış sorular — önce denemeler listesinde daha
// yukarıda (daha önce eklenmiş) olan denemenin yanlışları, sonra soru
// numarasına göre sıralı.
const wrongEligibleForCategory = (wrongQuestions, denemes, type, cat) =>
  wrongQuestions
    .filter((w) => {
      const d = denemes.find((x) => x.id === w.denemeId);
      const t = d?.type ?? "yokdil";
      return t === type && getCategory(w.question.number, type) === cat.label;
    })
    .sort((a, b) => {
      const diff = denemeIndexOf(denemes, a.denemeId) - denemeIndexOf(denemes, b.denemeId);
      if (diff !== 0) return diff;
      return (a.question.number ?? 0) - (b.question.number ?? 0);
    });

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
        set((s) => {
          const deneme = s.denemes.find((d) => d.id === id);
          const restored = deneme?.consumedWrongSnapshots || [];
          return {
            denemes: s.denemes.filter((d) => d.id !== id),
            wrongQuestions: [
              ...s.wrongQuestions.filter((w) => w.denemeId !== id),
              ...restored,
            ],
          };
        }),
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
        const lastAttemptSnapshot = {
          timeSpent: deneme.timeSpent || 0,
          questions: deneme.questions.map((q) => ({ ...q })),
        };
        set((s) => ({
          denemes: s.denemes.map((d) =>
            d.id !== id
              ? d
              : {
                  ...d,
                  pastAttempts: answered > 0 ? [...(d.pastAttempts || []), attemptSnapshot] : d.pastAttempts || [],
                  lastAttemptSnapshot: answered > 0 ? lastAttemptSnapshot : d.lastAttemptSnapshot,
                  timeSpent: 0,
                  questions: d.questions.map((q) => ({ ...q, userAnswer: null, timeSpent: 0 })),
                }
          ),
        }));
      },
      undoRetake: (id) => {
        const deneme = get().denemes.find((d) => d.id === id);
        if (!deneme?.lastAttemptSnapshot) return;
        set((s) => ({
          denemes: s.denemes.map((d) =>
            d.id !== id
              ? d
              : {
                  ...d,
                  timeSpent: d.lastAttemptSnapshot.timeSpent,
                  questions: d.lastAttemptSnapshot.questions,
                  pastAttempts: (d.pastAttempts || []).slice(0, -1),
                  lastAttemptSnapshot: null,
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
      // Denemelerdeki yanlış cevaplanmış ama Yanlışlarım'da olmayan soruları
      // pool'a geri ekler (ör. Yanlışlarım kazayla eksilmişse kurtarma).
      syncWrongFromDenemes: () => {
        const s = get();
        const existingKeys = new Set(s.wrongQuestions.map((w) => `${w.denemeId}:${w.questionId}`));
        const toAdd = [];
        s.denemes.forEach((d) => {
          d.questions.forEach((q) => {
            if (!q.userAnswer || q.userAnswer === q.answer) return;
            const key = `${d.id}:${q.id}`;
            if (existingKeys.has(key)) return;
            existingKeys.add(key);
            toAdd.push({
              id: uid(),
              denemeId: d.id,
              questionId: q.id,
              denemeName: d.name,
              question: { ...q },
              explanation: null,
              stats: emptyStats(),
              addedAt: Date.now(),
            });
          });
        });
        if (toAdd.length > 0) {
          set((st) => ({ wrongQuestions: [...st.wrongQuestions, ...toAdd] }));
        }
        return toAdd.length;
      },
      // Seçilen formatta (YÖKDİL/YDS) gerçek kategori dağılımına (80 soru)
      // uygun bir deneme oluşturmadan önce kategori bazlı önizleme.
      previewWrongExam: (type) => {
        const s = get();
        const rows = catsFor(type).map((cat) => {
          const quota = cat.max - cat.min + 1;
          const wrongAvailable = wrongEligibleForCategory(s.wrongQuestions, s.denemes, type, cat).length;
          const poolAvailable = poolForCategory(s.denemes, type, cat).length;
          return {
            label: cat.label,
            quota,
            wrongAvailable,
            poolAvailable,
            shortBy: Math.max(0, quota - poolAvailable),
            willRandomFill: wrongAvailable < quota && poolAvailable > wrongAvailable,
          };
        });
        return { rows, canCreate: rows.every((r) => r.shortBy === 0) };
      },
      createDenemeFromWrongs: (type) => {
        const s = get();
        const preview = s.previewWrongExam(type);
        if (!preview.canCreate) return null;

        const consumedWrongSnapshots = [];
        const finalQuestions = [];
        const usedKeys = new Set();

        catsFor(type).forEach((cat) => {
          const quota = cat.max - cat.min + 1;
          const wrongList = wrongEligibleForCategory(s.wrongQuestions, s.denemes, type, cat);
          const chosenWrongs = wrongList.slice(0, quota);
          chosenWrongs.forEach((w) => {
            finalQuestions.push({
              number: w.question.number,
              text: w.question.text,
              passage: w.question.passage,
              options: w.question.options,
              answer: w.question.answer,
            });
            consumedWrongSnapshots.push(w);
            usedKeys.add(`${w.denemeId}:${w.question.number}`);
          });
          const remaining = quota - chosenWrongs.length;
          if (remaining > 0) {
            const pool = poolForCategory(s.denemes, type, cat).filter(
              (p) => !usedKeys.has(`${p.denemeId}:${p.question.number}`)
            );
            shuffle(pool).slice(0, remaining).forEach((p) => {
              finalQuestions.push({
                number: p.question.number,
                text: p.question.text,
                passage: p.question.passage,
                options: p.question.options,
                answer: p.question.answer,
              });
              usedKeys.add(`${p.denemeId}:${p.question.number}`);
            });
          }
        });

        const id = uid();
        const prepared = finalQuestions.map((q, i) => ({
          ...q,
          id: `q${q.number ?? i + 1}_${i}`,
          userAnswer: null,
        }));
        const typeLabel = type === "yds" ? "YDS" : "YÖKDİL";
        const name = `Yanlışlardan Deneme — ${typeLabel} (${new Date().toLocaleDateString("tr-TR")})`;
        const consumedIds = new Set(consumedWrongSnapshots.map((w) => w.id));
        set((st) => ({
          denemes: [
            ...st.denemes,
            { id, name, type, createdAt: Date.now(), questions: prepared, consumedWrongSnapshots },
          ],
          wrongQuestions: st.wrongQuestions.filter((w) => !consumedIds.has(w.id)),
        }));
        return id;
      },

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
      addSynonym: (word, synonym) => {
        const s = synonym.trim();
        if (!s) return;
        set((st) => ({
          words: st.words.map((w) =>
            w.word !== word
              ? w
              : (w.synonyms || []).some((x) => x.toLowerCase() === s.toLowerCase())
                ? w
                : { ...w, synonyms: [...(w.synonyms || []), s] }
          ),
        }));
      },
      removeSynonym: (word, synonym) =>
        set((s) => ({
          words: s.words.map((w) =>
            w.word !== word ? w : { ...w, synonyms: (w.synonyms || []).filter((x) => x !== synonym) }
          ),
        })),
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

      // --- Denemelerden kelime çıkarma ---
      // Seçilen denemelerin metninde geçen, zaten kelimelerim listesinde
      // olan (bilinmeyen/kayıtlı) kelimelerin kesişimi — "denemeler" grubu.
      extractedWords: [], // words store'undaki word string'leri
      extractWordsFromDenemes: (denemeIds) => {
        const s = get();
        const idSet = new Set(denemeIds);
        const tokenSet = new Set();
        s.denemes
          .filter((d) => idSet.has(d.id))
          .forEach((d) => {
            d.questions.forEach((q) => {
              [q.passage, q.text, ...Object.values(q.options || {})].forEach((t) => {
                if (!t) return;
                (t.match(/[A-Za-z']+/g) || []).forEach((w) => {
                  tokenSet.add(w.replace(/^'+|'+$/g, "").toLowerCase());
                });
              });
            });
          });
        const matched = s.words.filter((w) => tokenSet.has(w.word.toLowerCase())).map((w) => w.word);
        set({ extractedWords: matched });
        return matched.length;
      },

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
