import { useState } from "react";
import { GRAMMAR_TOPICS, SIGNAL_WORDS } from "../lib/grammarTopics.js";
import { TOPICS } from "../lib/topics.js";
import { PHRASAL_VERBS, PREP_VERBS, GERUND_INFINITIVE } from "../lib/vocabPatterns.js";

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
          {topic.pitfalls?.length > 0 && (
            <>
              <h4 className="topic-subhead">Tuzaklar</h4>
              <ul className="topic-points topic-pitfall-list">
                {topic.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </>
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

function SignalGroup({ group }) {
  return (
    <div className="topic-card topic-card-static">
      <div className="topic-head topic-head-static">
        <span className="topic-title">{group.group}</span>
      </div>
      <div className="topic-body">
        <div className="signal-list">
          {group.items.map((it, i) => (
            <div key={i} className="signal-row">
              <span className="signal-word">{it.signal}</span>
              <span className="signal-arrow">→</span>
              <span className="signal-structure">{it.structure}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatternList({ items }) {
  return (
    <div className="list">
      {items.map((it, i) => (
        <div key={i} className="pattern-card">
          <div className="pattern-head">
            <span className="pattern-phrase">{it.phrase}</span>
            <span className="pattern-meaning muted">{it.meaning}</span>
          </div>
          <div className="topic-example" style={{ marginTop: 6 }}>
            <span className="topic-example-en">{it.example.en}</span>
            <span className="topic-example-tr muted">{it.example.tr}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function GerundList({ items }) {
  return (
    <div className="list">
      {items.map((it, i) => (
        <div key={i} className="pattern-card">
          <div className="pattern-head">
            <span className="pattern-phrase">{it.verb}</span>
            <span className="pattern-meaning muted">
              {it.meaning_tr} · {it.pattern === "gerund" ? "V-ing alır" : "to V alır"}
            </span>
          </div>
          <div className="topic-example" style={{ marginTop: 6 }}>
            <span className="topic-example-en">{it.before} {it.correct} {it.after}</span>
          </div>
          {it.note && <p className="topic-tip-example muted" style={{ marginTop: 6 }}>{it.note}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Topics() {
  const [tab, setTab] = useState("grammar"); // grammar | signals | tactics | patterns
  const [openId, setOpenId] = useState(null);
  const [patternSub, setPatternSub] = useState("phrasal"); // phrasal | prep | gerund

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Konu Anlatımı</h1>
        <div className="seg seg-wrap">
          <button className={tab === "grammar" ? "active" : ""} onClick={() => { setTab("grammar"); setOpenId(null); }}>Dil Bilgisi</button>
          <button className={tab === "signals" ? "active" : ""} onClick={() => { setTab("signals"); setOpenId(null); }}>Sinyal Kelimeler</button>
          <button className={tab === "tactics" ? "active" : ""} onClick={() => { setTab("tactics"); setOpenId(null); }}>Taktikler</button>
          <button className={tab === "patterns" ? "active" : ""} onClick={() => { setTab("patterns"); setOpenId(null); }}>Kalıplar</button>
        </div>
      </header>

      {tab === "grammar" && (
        <div className="list">
          {GRAMMAR_TOPICS.map((t) => (
            <GrammarCard key={t.id} topic={t} open={openId === t.id} onToggle={() => toggle(t.id)} />
          ))}
        </div>
      )}

      {tab === "signals" && (
        <>
          <p className="muted small" style={{ marginBottom: 12 }}>
            Boşluktan önce/sonra bu kelimelerden birini görünce, karşısındaki yapıyı ara.
          </p>
          <div className="list">
            {SIGNAL_WORDS.map((g) => <SignalGroup key={g.group} group={g} />)}
          </div>
        </>
      )}

      {tab === "tactics" && (
        <div className="list">
          {TOPICS.map((t) => (
            <TacticCard key={t.key} topic={t} open={openId === t.key} onToggle={() => toggle(t.key)} />
          ))}
        </div>
      )}

      {tab === "patterns" && (
        <>
          <div className="seg seg-wrap" style={{ marginBottom: 14 }}>
            <button className={patternSub === "phrasal" ? "active" : ""} onClick={() => setPatternSub("phrasal")}>Phrasal Verbs ({PHRASAL_VERBS.length})</button>
            <button className={patternSub === "prep" ? "active" : ""} onClick={() => setPatternSub("prep")}>Edatlı Fiiller ({PREP_VERBS.length})</button>
            <button className={patternSub === "gerund" ? "active" : ""} onClick={() => setPatternSub("gerund")}>Gerund/Infinitive ({GERUND_INFINITIVE.length})</button>
          </div>
          {patternSub === "gerund" ? (
            <GerundList items={GERUND_INFINITIVE} />
          ) : (
            <PatternList items={patternSub === "phrasal" ? PHRASAL_VERBS : PREP_VERBS} />
          )}
        </>
      )}
    </div>
  );
}
