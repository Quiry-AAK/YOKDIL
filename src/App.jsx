import { useState } from "react";
import { useStore } from "./store.js";
import Home from "./screens/Home.jsx";
import Solve from "./screens/Solve.jsx";
import Wrong from "./screens/Wrong.jsx";
import Review from "./screens/Review.jsx";
import Words from "./screens/Words.jsx";
import Settings from "./screens/Settings.jsx";
import AIPool from "./screens/AIPool.jsx";

const TABS = [
  { key: "home", label: "Denemeler", icon: "📄" },
  { key: "aipool", label: "AI Havuzu", icon: "🤖" },
  { key: "wrong", label: "Yanlışlarım", icon: "❌" },
  { key: "review", label: "Tekrar Çöz", icon: "🔁" },
  { key: "words", label: "Kelimeler", icon: "📖" },
  { key: "settings", label: "Ayarlar", icon: "⚙️" },
];

export default function App() {
  const [view, setView] = useState("home");
  const [activeDeneme, setActiveDeneme] = useState(null);
  const wrongCount = useStore((s) => s.wrongQuestions.length);
  const wordCount = useStore((s) => s.words.length);

  const navigate = (v, payload) => {
    if (v === "solve") setActiveDeneme(payload);
    setView(v);
  };

  let screen;
  if (view === "home") screen = <Home navigate={navigate} />;
  else if (view === "solve") screen = <Solve denemeId={activeDeneme} navigate={navigate} />;
  else if (view === "aipool") screen = <AIPool navigate={navigate} />;
  else if (view === "wrong") screen = <Wrong navigate={navigate} />;
  else if (view === "review") screen = <Review navigate={navigate} />;
  else if (view === "words") screen = <Words navigate={navigate} />;
  else if (view === "settings") screen = <Settings navigate={navigate} />;

  const activeTab = view === "solve" ? "home" : view;

  return (
    <div className="app">
      <main className="content">{screen}</main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={"tab" + (activeTab === t.key ? " active" : "")}
            onClick={() => navigate(t.key)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
            {t.key === "wrong" && wrongCount > 0 && (
              <span className="badge">{wrongCount}</span>
            )}
            {t.key === "words" && wordCount > 0 && (
              <span className="badge">{wordCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
