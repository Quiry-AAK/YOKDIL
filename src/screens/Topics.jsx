import { useState } from "react";
import { GRAMMAR_TOPICS, GENERAL_TIPS } from "../lib/grammarTopics.js";
import { TOPICS } from "../lib/topics.js";

function GrammarCard({ topic, open, onToggle }) {
  return (
    <div className="topic-card">
      <button className="topic-head" onClick={onToggle}>
        <span className="topic-title">{topic.title}</span>
        <span className="cat-chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="topic-body">
          <ul className="topic-points">
            {topic.points.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          {topic.examples?.length > 0 && (
            <div className="topic-examples">
              {topic.examples.map((ex, i) => (
                <div key={i} className="topic-example">
                  <span className="topic-example-en">{ex.en}</span>
                  <span className="topic-example-tr muted">{ex.tr}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TacticCard({ topic, open, onToggle }) {
  return (
    <div className="topic-card">
      <button className="topic-head" onClick={onToggle}>
        <span className="topic-title">{topic.label}</span>
        <span className="cat-chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="topic-body">
          {topic.subtitle && <p className="muted small" style={{ marginTop: 0 }}>{topic.subtitle}</p>}
          {topic.whatIsIt && <p className="topic-desc">{topic.whatIsIt}</p>}

          {topic.tactics?.length > 0 && (
            <>
              <h4 className="topic-subhead">Taktikler</h4>
              <ul className="topic-points">
                {topic.tactics.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </>
          )}

          {topic.tips?.length > 0 && (
            <>
              <h4 className="topic-subhead">İpuçları</h4>
              {topic.tips.map((tip, i) => (
                <div key={i} className="topic-tip">
                  <p className="topic-tip-title">{tip.title}</p>
                  <p className="topic-tip-body">{tip.body}</p>
                  {tip.example && <p className="topic-tip-example muted">{tip.example}</p>}
                </div>
              ))}
            </>
          )}

          {topic.pitfalls?.length > 0 && (
            <>
              <h4 className="topic-subhead">Sık Yapılan Hatalar</h4>
              {topic.pitfalls.map((p, i) => (
                <div key={i} className="topic-tip topic-pitfall">
                  <p className="topic-tip-title">⚠️ {p.title}</p>
                  <p className="topic-tip-body">{p.body}</p>
                  {p.example && <p className="topic-tip-example muted">{p.example}</p>}
                </div>
              ))}
            </>
          )}

          {topic.summary && (
            <div className="topic-summary">{topic.summary}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Topics() {
  const [tab, setTab] = useState("grammar"); // grammar | tactics | general
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Konu Anlatımı</h1>
        <div className="seg">
          <button className={tab === "grammar" ? "active" : ""} onClick={() => { setTab("grammar"); setOpenId(null); }}>Dil Bilgisi</button>
          <button className={tab === "tactics" ? "active" : ""} onClick={() => { setTab("tactics"); setOpenId(null); }}>Taktikler</button>
          <button className={tab === "general" ? "active" : ""} onClick={() => { setTab("general"); setOpenId(null); }}>Genel</button>
        </div>
      </header>

      {tab === "grammar" && (
        <div className="list">
          {GRAMMAR_TOPICS.map((t) => (
            <GrammarCard key={t.id} topic={t} open={openId === t.id} onToggle={() => toggle(t.id)} />
          ))}
        </div>
      )}

      {tab === "tactics" && (
        <div className="list">
          {TOPICS.map((t) => (
            <TacticCard key={t.key} topic={t} open={openId === t.key} onToggle={() => toggle(t.key)} />
          ))}
        </div>
      )}

      {tab === "general" && (
        <div className="card">
          <ul className="topic-points">
            {GENERAL_TIPS.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
