import { useState, useMemo } from "react";
import { useStore, WRONG_EXAM_MIN } from "../store.js";

export default function CreateExam({ navigate }) {
  const wrongQuestions = useStore((s) => s.wrongQuestions);
  const denemes = useStore((s) => s.denemes);
  const createDenemeFromWrongs = useStore((s) => s.createDenemeFromWrongs);

  const [type, setType] = useState("yokdil");

  const eligibleCount = useMemo(() => {
    return wrongQuestions.filter((w) => {
      const d = denemes.find((x) => x.id === w.denemeId);
      return (d?.type ?? "yokdil") === type;
    }).length;
  }, [wrongQuestions, denemes, type]);

  const canCreate = eligibleCount >= WRONG_EXAM_MIN;

  const onCreate = () => {
    const id = createDenemeFromWrongs(type);
    if (id) navigate("solve", id);
  };

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Deneme Oluştur</h1>
        <p className="muted">Yanlışlarım havuzundaki sorulardan otomatik deneme oluştur. Kullanılan sorular Yanlışlarım'dan çıkar.</p>
      </header>

      <div className="card">
        <p className="muted small" style={{ marginBottom: 8 }}>Format</p>
        <div className="seg seg-wrap">
          <button className={type === "yokdil" ? "active" : ""} onClick={() => setType("yokdil")}>YÖKDİL</button>
          <button className={type === "yds" ? "active" : ""} onClick={() => setType("yds")}>YDS</button>
        </div>

        <p className="muted small" style={{ margin: "14px 0" }}>
          {(type === "yds" ? "YDS" : "YÖKDİL")} formatında yanlışlarım havuzunda{" "}
          <strong>{eligibleCount}</strong> soru var
          {!canCreate && <> — en az <strong>{WRONG_EXAM_MIN}</strong> soru gerekiyor.</>}
        </p>

        <button className="btn btn-primary btn-big" onClick={onCreate} disabled={!canCreate}>
          Deneme Oluştur
        </button>
      </div>
    </div>
  );
}
