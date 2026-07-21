import { useState } from "react";
import { useStore } from "./store.js";
import Home from "./screens/Home.jsx";
import Solve from "./screens/Solve.jsx";
import Wrong from "./screens/Wrong.jsx";
import Review from "./screens/Review.jsx";
import Words from "./screens/Words.jsx";
import Settings from "./screens/Settings.jsx";
import AIPool from "./screens/AIPool.jsx";
import Topics from "./screens/Topics.jsx";
import PatternQuiz from "./screens/PatternQuiz.jsx";
import WordCards from "./screens/WordCards.jsx";
import TrueFalse from "./screens/TrueFalse.jsx";
import ExamGame from "./screens/ExamGame.jsx";
import ClozeGame from "./screens/ClozeGame.jsx";
import { pickActiveDeneme } from "./lib/denemeHelpers.js";

const NAV_ITEMS = [
  { key: "home", label: "Denemeler", icon: "📄" },
  { key: "aipool", label: "AI Havuzu", icon: "🤖" },
  { key: "wrong", label: "Yanlışlarım", icon: "❌" },
  { key: "review", label: "Tekrar Çöz", icon: "🔁" },
  { key: "topics", label: "Konular", icon: "📚" },
  { key: "patternquiz", label: "Kalıp Quiz", icon: "🧩" },
  { key: "truefalse", label: "Doğru / Yanlış", icon: "⚡" },
  { key: "sentencecomp", label: "Cümle Tamamlama", icon: "✍️" },
  { key: "oddsentence", label: "Bozan Cümleyi Bul", icon: "🔍" },
  { key: "clozegame", label: "Cloze Test", icon: "🧠" },
  { key: "words", label: "Kelimeler", icon: "📖" },
  { key: "wordcards", label: "Kelime Kartları", icon: "🎴" },
  { key: "settings", label: "Ayarlar", icon: "⚙️" },
];

export default function App() {
  const [view, setView] = useState("home");
  const [activeDeneme, setActiveDeneme] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrongCount = useStore((s) => s.wrongQuestions.length);
  const wordCount = useStore((s) => s.words.length);
  const denemes = useStore((s) => s.denemes);

  const navigate = (v, payload) => {
    if (v === "solve") setActiveDeneme(payload);
    setView(v);
    setMenuOpen(false);
  };

  let screen;
  if (view === "home") screen = <Home navigate={navigate} />;
  else if (view === "solve") screen = <Solve denemeId={activeDeneme} navigate={navigate} />;
  else if (view === "aipool") screen = <AIPool navigate={navigate} />;
  else if (view === "wrong") screen = <Wrong navigate={navigate} />;
  else if (view === "review") screen = <Review navigate={navigate} />;
  else if (view === "topics") screen = <Topics navigate={navigate} />;
  else if (view === "patternquiz") screen = <PatternQuiz navigate={navigate} />;
  else if (view === "words") screen = <Words navigate={navigate} />;
  else if (view === "wordcards") screen = <WordCards navigate={navigate} />;
  else if (view === "truefalse") screen = <TrueFalse navigate={navigate} />;
  else if (view === "sentencecomp") screen = <ExamGame topicKey="cumle-tamamlama" title="Cümle Tamamlama" subtitle="Cümleyi anlamca ve yapısal olarak doğru bitiren şıkkı seç." />;
  else if (view === "oddsentence") screen = <ExamGame topicKey="anlam-butunlugu" title="Bozan Cümleyi Bul" subtitle="Paragrafın akışını bozan cümleyi bul." />;
  else if (view === "clozegame") screen = <ClozeGame navigate={navigate} />;
  else if (view === "settings") screen = <Settings navigate={navigate} />;

  const activeNav = view === "solve" ? "home" : view;

  return (
    <div className="app">
      <header className="topbar">
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)} aria-label="Menü">
          <span /><span /><span />
        </button>
        <span className="topbar-title">YÖKDİL Asistan</span>
      </header>

      <main className="content">{screen}</main>

      <nav className="bottombar">
        <button
          className={"bottom-btn" + (view === "solve" ? " active" : "")}
          disabled={!denemes.length}
          onClick={() => {
            const active = pickActiveDeneme(denemes);
            if (active) navigate("solve", active.id);
          }}
        >
          <span className="bottom-icon">▶️</span>
          <span className="bottom-label">Deneme Çöz</span>
        </button>
        <button className={"bottom-btn" + (view === "wrong" ? " active" : "")} onClick={() => navigate("wrong")}>
          <span className="bottom-icon">❌</span>
          <span className="bottom-label">Yanlışlarım</span>
          {wrongCount > 0 && <span className="badge bottom-badge">{wrongCount}</span>}
        </button>
        <button className={"bottom-btn" + (view === "patternquiz" ? " active" : "")} onClick={() => navigate("patternquiz")}>
          <span className="bottom-icon">🧩</span>
          <span className="bottom-label">Kalıp Quiz</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span className="drawer-brand">YÖKDİL Asistan</span>
              <button className="icon-btn" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="drawer-items">
              {NAV_ITEMS.map((t) => (
                <button
                  key={t.key}
                  className={"drawer-item" + (activeNav === t.key ? " active" : "")}
                  onClick={() => navigate(t.key)}
                >
                  <span className="drawer-icon">{t.icon}</span>
                  <span className="drawer-label">{t.label}</span>
                  {t.key === "wrong" && wrongCount > 0 && <span className="badge drawer-badge">{wrongCount}</span>}
                  {t.key === "words" && wordCount > 0 && <span className="badge drawer-badge">{wordCount}</span>}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
