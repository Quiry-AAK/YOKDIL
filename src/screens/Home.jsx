import { useRef, useState } from "react";
import { useStore } from "../store.js";
import { fileToBase64 } from "../lib/pdf.js";
import { extractDeneme } from "../lib/ai.js";

export default function Home({ navigate }) {
  const denemes = useStore((s) => s.denemes);
  const settings = useStore((s) => s.settings);
  const addDeneme = useStore((s) => s.addDeneme);
  const removeDeneme = useStore((s) => s.removeDeneme);
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!settings.apiKey) {
      setError("Önce Ayarlar ekranından ücretsiz Gemini API anahtarını ekle.");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(4);
    // Tek bir API isteği olduğu için ilerleme tahmini olarak ilerletilir,
    // istek bitince %100'e tamamlanır.
    const timer = setInterval(() => {
      setProgress((p) => (p < 92 ? p + Math.max(1, Math.round((92 - p) / 14)) : p));
    }, 450);
    try {
      const base64Pdf = await fileToBase64(file);
      setProgress((p) => Math.max(p, 20));
      const questions = await extractDeneme({
        apiKey: settings.apiKey,
        model: settings.model,
        base64Pdf,
      });
      if (!questions.length) throw new Error("PDF'ten soru çıkarılamadı.");
      clearInterval(timer);
      setProgress(100);
      const name = file.name.replace(/\.pdf$/i, "");
      const id = addDeneme(name, questions);
      setTimeout(() => navigate("solve", id), 350);
    } catch (err) {
      clearInterval(timer);
      setProgress(0);
      setError(err.message || "PDF işlenemedi.");
      setLoading(false);
    }
  };

  const progressLabel =
    progress < 20
      ? "PDF okunuyor…"
      : progress < 65
      ? "Sorular çıkarılıyor…"
      : progress < 100
      ? "Cevap anahtarı eşleştiriliyor…"
      : "Hazır!";

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Denemelerim</h1>
        <p className="muted">PDF yükle, AI soruları çıkarsın, çöz.</p>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={onPick}
      />

      {loading ? (
        <div className="card loading-card">
          <div className="spinner" />
          <p className="loading-title">AI denemeyi okuyor…</p>
          <div className="progress big">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="muted small loading-sub">
            {progressLabel} · %{progress}
          </p>
        </div>
      ) : (
        <button
          className="btn btn-primary btn-big"
          onClick={() => fileRef.current?.click()}
        >
          ＋ Deneme PDF Yükle
        </button>
      )}

      {error && <div className="alert">{error}</div>}

      {denemes.length === 0 && !loading && (
        <div className="empty">
          <p>Henüz deneme yok.</p>
          <p className="muted">
            Yukarıdan bir YÖKDİL/YDS deneme PDF'i yükle. Cevap anahtarı son
            sayfada olsun — AI onu okuyup soruları kontrol edecek.
          </p>
        </div>
      )}

      <div className="list">
        {denemes.map((d) => {
          const answered = d.questions.filter((q) => q.userAnswer).length;
          const correct = d.questions.filter(
            (q) => q.userAnswer && q.userAnswer === q.answer
          ).length;
          return (
            <div key={d.id} className="card deneme-card">
              <div className="deneme-info" onClick={() => navigate("solve", d.id)}>
                <h3>{d.name}</h3>
                <p className="muted">
                  {d.questions.length} soru · {answered} cevaplandı · {correct} doğru
                </p>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${(answered / d.questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <button
                className="icon-btn"
                title="Denemeyi sil"
                onClick={() => {
                  if (confirm(`"${d.name}" silinsin mi?`)) removeDeneme(d.id);
                }}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
