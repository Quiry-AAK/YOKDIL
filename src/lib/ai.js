import { GoogleGenAI, Type } from "@google/genai";

function getAI(apiKey) {
  if (!apiKey) throw new Error("API anahtarı ayarlanmamış. Ayarlar ekranından ekle.");
  return new GoogleGenAI({ apiKey });
}

function textOf(response) {
  const t = response?.text;
  if (!t) throw new Error("AI boş cevap döndü (limit aşıldı veya içerik engellendi olabilir).");
  return t;
}

// ---- 1) PDF → JSON için Claude tarayıcı promptu ----

export const EXTRACT_PROMPT = `Bu bir YÖKDİL veya YDS İngilizce deneme sınavı PDF'idir.

Görevin: Tüm soruları sırayla, numaralarıyla birlikte eksiksiz çıkarmak.

Kurallar:
- Soru metni ve A–E şıklarını TAM, ORİJİNAL İngilizce haliyle yaz. Çevirme, kısaltma veya düzeltme yapma.
- Okuma parçası (reading passage) varsa: o parçaya ait soru grubunun sadece İLK sorusunun "passage" alanına tüm parçayı koy; diğer soruların "passage" alanını null bırak.
- 4 şıklı sorularda E alanını null bırak.
- Cevap anahtarı PDF'in SON sayfasındadır. Her sorunun "answer" alanına doğru şık harfini (A–E) yaz.
- Soruları numara sırasına göre küçükten büyüğe sırala.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

{"questions":[{"number":1,"passage":null,"text":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":null},"answer":"A"},{"number":2,"passage":null,"text":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":null},"answer":"B"}]}`;

// ---- 2) Yanlış yapılan soru için açıklama ----

export async function explainQuestion({ apiKey, model, question }) {
  const ai = getAI(apiKey);
  const opts = question.options;
  const optionsText = ["A", "B", "C", "D", "E"]
    .filter((k) => opts[k])
    .map((k) => `${k}) ${opts[k]}`)
    .join("\n");
  const prompt = `Aşağıdaki YÖKDİL/YDS sorusunu Türkçe açıkla.

${question.passage ? `Parça:\n${question.passage}\n\n` : ""}Soru:
${question.text}

Şıklar:
${optionsText}

Doğru cevap: ${question.answer}
Benim verdiğim (yanlış) cevap: ${question.userAnswer || "-"}

Lütfen kısa ve net şekilde açıkla:
1. Doğru cevabın neden ${question.answer} olduğunu (gramer/anlam/bağlaç vb. hangi kural).
2. Benim seçtiğim şık neden yanlış / tuzak neydi.
Sade Türkçe kullan, gereksiz uzatma.`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return textOf(response);
}

// ---- 3) İşaretlenen kelime analizi (kelime oyunu için) ----

const wordSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    meaning_tr: { type: Type.STRING },
    pos: { type: Type.STRING },
    example_en: { type: Type.STRING },
    example_tr: { type: Type.STRING },
    distractors_tr: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["word", "meaning_tr", "pos", "example_en", "example_tr", "distractors_tr"],
};

export async function analyzeWords({ apiKey, model, words }) {
  const ai = getAI(apiKey);
  const list = words
    .map((w, i) => `${i + 1}. "${w.word}"${w.context ? ` — cümle: ${w.context}` : ""}`)
    .join("\n");
  const prompt = `Aşağıdaki İngilizce kelimeler için JSON dizisi üret. Sırayı koru, her kelime bir eleman.

Her eleman için:
- word: kelimenin kendisi (küçük harf)
- meaning_tr: bağlamdaki kısa Türkçe anlamı
- pos: türü (isim/fiil/sıfat/zarf/edat/bağlaç...)
- example_en: kısa İngilizce örnek cümle
- example_tr: örnek cümlenin Türkçe çevirisi
- distractors_tr: kelime oyunu için 3 adet mantıklı ama YANLIŞ Türkçe anlam

Kelimeler:
${list}`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: wordSchema },
    },
  });
  return JSON.parse(textOf(response));
}
