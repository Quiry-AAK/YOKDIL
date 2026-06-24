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

// ---- 1) PDF'ten soruları + cevap anahtarını çıkar ----

const denemeSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.INTEGER },
          passage: { type: Type.STRING, nullable: true },
          text: { type: Type.STRING },
          options: {
            type: Type.OBJECT,
            properties: {
              A: { type: Type.STRING },
              B: { type: Type.STRING },
              C: { type: Type.STRING },
              D: { type: Type.STRING },
              E: { type: Type.STRING, nullable: true },
            },
            required: ["A", "B", "C", "D"],
          },
          answer: { type: Type.STRING },
        },
        required: ["number", "text", "options", "answer"],
      },
    },
  },
  required: ["questions"],
};

const EXTRACT_PROMPT = `Bu bir YÖKDİL veya YDS İngilizce deneme sınavı PDF'idir.

Görevin: Tüm soruları SIRAYI BOZMADAN, numaralarıyla birlikte eksiksiz çıkarmak.

Kurallar:
- Soru metnini, boşluklu cümleyi ve A-E şıklarını TAM ve ORİJİNAL (İngilizce) haliyle yaz. Hiçbir şeyi çevirme, kısaltma veya düzeltme.
- Okuma parçası (reading passage) varsa: o parçaya bağlı soru grubunun yalnızca İLK sorusunun "passage" alanına tüm parça metnini koy. Aynı gruptaki diğer soruların "passage" alanını boş (null) bırak.
- Bir soruda yalnızca 4 şık varsa E alanını boş (null) bırak.
- Cevap anahtarı genellikle PDF'in SON sayfa(lar)ındadır (ör. "1.C 2.A 3.E ..." veya cevap tablosu). Bu anahtarı bul ve her sorunun "answer" alanına doğru şık harfini (A-E) yaz. Anahtarı bulamadığın soruda en olası cevabı yaz ama mümkün olduğunca anahtara dayan.
- Soruları PDF'teki numara sırasına göre küçükten büyüğe sırala.

Sadece istenen JSON'u döndür.`;

export async function extractDeneme({ apiKey, model, base64Pdf }) {
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model,
    contents: [
      { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
      { text: EXTRACT_PROMPT },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: denemeSchema,
      maxOutputTokens: 65536,
    },
  });
  const data = JSON.parse(textOf(response));
  return data.questions || [];
}

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

export async function analyzeWord({ apiKey, model, word, context }) {
  const ai = getAI(apiKey);
  const prompt = `İngilizce kelime: "${word}"
${context ? `Geçtiği cümle: ${context}` : ""}

Bu kelime için JSON üret:
- meaning_tr: bağlamdaki kısa Türkçe anlamı
- pos: türü (isim/fiil/sıfat/zarf/edat/bağlaç...)
- example_en: kısa İngilizce örnek cümle
- example_tr: örnek cümlenin Türkçe çevirisi
- distractors_tr: kelime oyunu için 3 adet mantıklı ama YANLIŞ Türkçe anlam`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: wordSchema,
    },
  });
  return JSON.parse(textOf(response));
}
