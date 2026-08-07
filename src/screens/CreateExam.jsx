import { useState, useMemo } from "react";
import { useStore } from "../store.js";

export default function CreateExam({ navigate }) {
  const wrongQuestions = useStore((s) => s.wrongQuestions);
  const denemes = useStore((s) => s.denemes);
  const previewWrongExam = useStore((s) => s.previewWrongExam);
  const createDenemeFromWrongs = useStore((s) => s.createDenemeFromWrongs);

  const [type, setType] = useState("yokdil");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const preview = useMemo(() => previewWrongExam(type), [type, wrongQuestions, denemes]);
  const total = preview.rows.reduce((sum, r) => sum + r.quota, 0);

  const onCreate = () => {
    const id = createDenemeFromWrongs(type);
    if (id) navigate("solve", id);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Deneme Oluştur</h1>
        <p className="muted">
          Yanlışlarım havuzundan, gerçek {type === "yds" ? "YDS" : "YÖKDİL"} formatına uygun {total} soruluk bir
          deneme oluşturur. Bir kategoride yeterli yanlış yoksa, kalan sorular denemelerinden rastgele tamamlanır.
          Kullanılan yanlış sorular Yanlışlarım'dan çıkar; bu deneme silinirse geri döner.
        </p>
      </header>

      <div className="card">
        <p className="muted small" style={{ marginBottom: 8 }}>Format</p>
        <div className="seg seg-wrap">
          <button className={type === "yokdil" ? "active" : ""} onClick={() => setType("yokdil")}>YÖKDİL</button>
          <button className={type === "yds" ? "active" : ""} onClick={() => setType("yds")}>YDS</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Kategori Dağılımı</h3>
        {preview.rows.map((r) => (
          <div key={r.label} className="score-row">
            <span className="score-label">{r.label}</span>
            {r.shortBy > 0 ? (
              <span className="score-val bad">{r.poolAvailable}/{r.quota} — {r.shortBy} eksik</span>
            ) : r.willRandomFill ? (
              <span className="score-val" style={{ color: "#f59e0b" }}>
                {r.wrongAvailable}/{r.quota} yanlış — kalanı rastgele
              </span>
            ) : (
              <span className="score-val good">{r.quota}/{r.quota} yanlış</span>
            )}
          </div>
        ))}
      </div>

      {!preview.canCreate && (
        <div className="alert">
          Bazı kategorilerde yeterli soru yok (ne yanlışlarında ne de denemelerinde). {total} soruluk tam bir
          deneme oluşturulamıyor — önce o kategorilerden deneme çözüp havuzu büyütmen gerekiyor.
        </div>
      )}

      <button className="btn btn-primary btn-big" onClick={onCreate} disabled={!preview.canCreate}>
        Deneme Oluştur
      </button>
    </div>
  );
}
