import { useState } from "react";
import { useStore } from "../store.js";

const MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash — önerilen", hint: "Ücretsiz, büyük denemeleri de okur" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite — en hızlı", hint: "Ücretsiz, daha hızlı/hafif" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", hint: "Ücretsiz; çok uzun denemelerde kesilebilir" },
];

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [key, setKey] = useState(settings.apiKey);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSettings({ apiKey: key.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Ayarlar</h1>
      </header>

      <div className="card">
        <h3>Google Gemini API Anahtarı (ücretsiz)</h3>
        <p className="muted">
          AI'nın çalışması için gerekli. Cihazında saklanır, başka yere
          gönderilmez.
        </p>
        <div className="row">
          <input
            type="password"
            className="input"
            placeholder="AIza..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button className="btn btn-primary" onClick={save}>
            {saved ? "Kaydedildi ✓" : "Kaydet"}
          </button>
        </div>
        <span className={"status " + (settings.apiKey ? "ok" : "warn")}>
          {settings.apiKey ? "● Anahtar ayarlı" : "● Anahtar yok"}
        </span>
      </div>

      <div className="card">
        <h3>AI Modeli</h3>
        <p className="muted">PDF okuma, açıklamalar ve kelime analizi bu modelle yapılır.</p>
        <div className="model-list">
          {MODELS.map((m) => (
            <label
              key={m.id}
              className={"model-opt" + (settings.model === m.id ? " selected" : "")}
            >
              <input
                type="radio"
                name="model"
                checked={settings.model === m.id}
                onChange={() => setSettings({ model: m.id })}
              />
              <span>
                <strong>{m.label}</strong>
                <br />
                <span className="muted">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="card help">
        <h3>Ücretsiz anahtar nasıl alınır?</h3>
        <ol>
          <li>
            Google hesabınla <strong>aistudio.google.com/apikey</strong> adresine gir.
          </li>
          <li><strong>Create API key</strong> (API anahtarı oluştur) butonuna bas.</li>
          <li>Çıkan <code>AIza...</code> anahtarını kopyala, yukarıya yapıştır, Kaydet.</li>
          <li>
            <strong>Ödeme/kart gerekmez</strong> — ücretsiz katman yeterli. Sadece
            dakika/gün başına istek limiti vardır; bir denemeyi okumak tek istektir.
          </li>
        </ol>
      </div>
    </div>
  );
}
