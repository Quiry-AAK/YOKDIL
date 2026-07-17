import { useState, useMemo } from "react";
import { useStore } from "../store.js";
import MarkableText from "../components/MarkableText.jsx";
import { buildGeneratePrompt } from "../lib/ai.js";
import { YOKDIL_CATS, YDS_CATS } from "../lib/categories.js";

const LETTERS = ["A", "B", "C", "D", "E"];

function pickRandom(pool) {
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function AIPool() {
  const aiPool = useStore((s) => s.aiPool);
  const addAIPoolQuestions = useStore((s) => s.addAIPoolQuestions);
  const answerAIPoolQuestion = useStore((s) => s.answerAIPoolQuestion);

  const [examType, setExamType] = useState("yokdil");
  const [mode, setMode] = useState("browse"); // "browse" | "add"

  // --- Soru ekleme (havuza) ---
  const [addCategory, setAddCategory] = useState(null);
  const [count, setCount] = useState(10);
  const [promptText, setPromptText] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [addError, setAddError] = useState(null);
  const [addMsg, setAddMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  // --- Çözme ---
  const [solveCategory, setSolveCategory] = useState(null);
  const [current, setCurrent] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);

  const cats = examType === "yds" ? YDS_CATS : YOKDIL_CATS;

  const catCounts = useMemo(() => {
    const counts = {};
    aiPool.forEach((q) => {
      if (q.type !== examType) return;
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [aiPool, examType]);

  const resetAddFlow = () => {
    setAddCategory(null);
    setPromptText(null);
    setJsonText("");
    setAddError(null);
  };

  const onCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onGeneratePrompt = () => {
    setPromptText(buildGeneratePrompt(examType, addCategory, count));
    setJsonText("");
    setAddError(null);
  };

  const onSubmitAdd = () => {
    setAddError(null);
    let data;
    try {
      data = JSON.parse(jsonText.trim());
    } catch {
      setAddError("Geçersiz JSON. AI'nin verdiği çıktıyı tam ve değiştirmeden yapıştır.");
      return;
    }
    const questions = Array.isArray(data) ? data : data.questions;
    if (!Array.isArray(questions) || !questions.length) {
      setAddError('Sorular bulunamadı. JSON içinde "questions" dizisi olmalı.');
      return;
    }
    const n = addAIPoolQuestions(examType, addCategory, questions);
    setAddMsg(`${n} soru "${addCategory}" havuzuna eklendi.`);
    setTimeout(() => setAddMsg(null), 2500);
    resetAddFlow();
    setMode("browse");
  };

  const enterCategory = (label) => {
    const pool = aiPool.filter((q) => q.type === examType && q.category === label);
    setSolveCategory(label);
    setCurrent(pickRandom(pool));
    setUserAnswer(null);
  };

  const choose = (letter) => {
    if (userAnswer || !current) return;
    answerAIPoolQuestion(current.id, letter);
    setUserAnswer(letter);
  };

  const nextQuestion = () => {
    const fresh = useStore.getState().aiPool.filter(
      (q) => q.type === examType && q.category === solveCategory
    );
    setCurrent(pickRandom(fresh));
    setUserAnswer(null);
  };

  // ---- Soru ekleme ekranı ----
  if (mode === "add") {
    return (
      <div className="screen">
        <header className="screen-head">
          <button className="link" onClick={() => { setMode("browse"); resetAddFlow(); }}>← AI Soru Havuzu</button>
        </header>
        <h1 style={{ fontSize: 20, margin: "0 0 12px" }}>Havuza Soru Ekle</h1>

        <div className="type-row">
          <span className="muted small">Sınav türü:</span>
          <div className="seg">
            <button className={examType === "yokdil" ? "active" : ""} onClick={() => { setExamType("yokdil"); setAddCategory(null); resetAddFlow(); }}>YÖKDİL</button>
            <button className={examType === "yds" ? "active" : ""} onClick={() => { setExamType("yds"); setAddCategory(null); resetAddFlow(); }}>YDS</button>
          </div>
        </div>

        {!addCategory ? (
          <div className="list">
            <p className="muted small" style={{ margin: "6px 0" }}>Hangi kategoriye soru üretilsin?</p>
            {cats.map((c) => (
              <div key={c.label} className="card cat-pick-card" onClick={() => setAddCategory(c.label)}>
                <div className="cat-pick-label">{c.label}</div>
                <div className="cat-pick-sub muted small">Havuzda {catCounts[c.label] || 0} soru</div>
              </div>
            ))}
          </div>
        ) : !promptText ? (
          <div className="card">
            <p className="q-text small" style={{ margin: "0 0 10px" }}>{addCategory}</p>
            <div className="row" style={{ alignItems: "center" }}>
              <span className="muted small">Soru sayısı:</span>
              <input
                className="input"
                type="number"
                min={1}
                max={30}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                style={{ maxWidth: 90 }}
              />
            </div>
            <div className="claude-actions" style={{ marginTop: 10 }}>
              <button className="btn btn-ghost" onClick={() => setAddCategory(null)}>Geri</button>
              <button className="btn btn-primary" onClick={onGeneratePrompt}>Prompt Oluştur →</button>
            </div>
          </div>
        ) : (
          <div className="card claude-card">
            <p className="claude-filename">🤖 {addCategory} · {count} soru</p>
            <ol className="claude-steps">
              <li>Aşağıdaki promptu kopyala, bir AI sohbetine (Claude, Gemini vb.) yapıştır</li>
              <li>AI'nin verdiği JSON'u altta yapıştır</li>
            </ol>
            <div className="prompt-box">
              <pre className="prompt-text">{promptText}</pre>
              <button className="btn btn-sm prompt-copy-btn" onClick={onCopy}>
                {copied ? "✓ Kopyalandı" : "Kopyala"}
              </button>
            </div>
            <textarea
              className="input json-paste"
              placeholder="AI'nin JSON çıktısını buraya yapıştır…"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={6}
            />
            {addError && <div className="alert">{addError}</div>}
            <div className="claude-actions">
              <button className="btn btn-ghost" onClick={resetAddFlow}>İptal</button>
              <button className="btn btn-primary" disabled={!jsonText.trim()} onClick={onSubmitAdd}>Havuza Ekle</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- Çözme: kategori seçilmemiş ----
  if (!solveCategory) {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>AI Soru Havuzu</h1>
          <p className="muted">AI ile üretilen sorulardan kategoriye göre çöz.</p>
        </header>

        {addMsg && <div className="alert alert-ok">{addMsg}</div>}

        <button className="btn btn-primary btn-big" onClick={() => setMode("add")}>
          ＋ Havuza Soru Ekle
        </button>

        <div className="type-row">
          <span className="muted small">Sınav türü:</span>
          <div className="seg">
            <button className={examType === "yokdil" ? "active" : ""} onClick={() => setExamType("yokdil")}>YÖKDİL</button>
            <button className={examType === "yds" ? "active" : ""} onClick={() => setExamType("yds")}>YDS</button>
          </div>
        </div>

        <div className="list" style={{ marginTop: 10 }}>
          {cats.filter((c) => catCounts[c.label]).length === 0 ? (
            <div className="empty">
              <p>Bu türde havuzda henüz soru yok.</p>
              <p className="muted">Yukarıdan "Havuza Soru Ekle" ile başla.</p>
            </div>
          ) : (
            cats.filter((c) => catCounts[c.label]).map((c) => (
              <div key={c.label} className="card cat-pick-card" onClick={() => enterCategory(c.label)}>
                <div className="cat-pick-label">{c.label}</div>
                <div className="cat-pick-sub muted small">Havuzda {catCounts[c.label]} soru</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ---- Çözme: havuzda soru kalmadı ----
  if (!current) {
    return (
      <div className="screen">
        <header className="screen-head">
          <button className="link" onClick={() => setSolveCategory(null)}>← AI Soru Havuzu</button>
        </header>
        <div className="empty">
          <p>Bu kategoride havuzda soru kalmadı.</p>
          <p className="muted">"Havuza Soru Ekle" ile yeni soru üretebilirsin.</p>
        </div>
        <button className="btn btn-primary btn-big" onClick={() => setMode("add")}>＋ Havuza Soru Ekle</button>
      </div>
    );
  }

  // ---- Çözme: soru ekranı ----
  const q = current;
  const answered = !!userAnswer;
  const isCorrect = userAnswer === q.answer;
  const remaining = aiPool.filter((x) => x.type === examType && x.category === solveCategory).length;

  return (
    <div className="screen">
      <header className="screen-head solve-head">
        <button className="link" onClick={() => setSolveCategory(null)}>← AI Soru Havuzu</button>
        <span className="counter">Havuzda {remaining}</span>
      </header>

      <p className="hint-bar">
        💡 Cevap için <b>harfe (A/B/C…)</b> dokun · İngilizce <b>kelimeye</b> dokunca bekleme listesine eklenir.
      </p>

      <div className="card question-card">
        {q.passage && (
          <div className="passage"><MarkableText text={q.passage} sourceType={q.type ?? examType} /></div>
        )}
        <div className="q-text">
          <MarkableText text={q.text} sourceType={q.type ?? examType} />
        </div>
        <div className="options">
          {LETTERS.filter((l) => q.options[l]).map((l) => {
            let cls = "option";
            if (answered) {
              if (l === q.answer) cls += " correct";
              else if (l === userAnswer) cls += " wrong";
            }
            return (
              <div key={l} className={cls}>
                <button className="opt-letter" onClick={() => choose(l)} disabled={answered} title="Bu şıkkı seç">{l}</button>
                <span className="opt-text"><MarkableText text={q.options[l]} sourceType={q.type ?? examType} /></span>
              </div>
            );
          })}
        </div>
        {answered && (
          <div className={"feedback " + (isCorrect ? "good" : "bad")}>
            {isCorrect ? "✓ Doğru!" : `✗ Yanlış. Doğru cevap: ${q.answer}`}
            {!isCorrect && <span className="muted"> — Yanlışlarım panelinde açıklamayı görebilirsin.</span>}
          </div>
        )}
      </div>

      {answered && (
        <div className="nav-row">
          <button className="btn btn-primary" onClick={nextQuestion}>Sonraki Soru →</button>
        </div>
      )}
    </div>
  );
}
