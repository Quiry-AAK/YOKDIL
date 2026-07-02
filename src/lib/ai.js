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
- Okuma parçası (reading passage) varsa: o parçaya ait soru grubunun TÜM sorularının "passage" alanına aynı parça metnini koy. Parçasız sorularda "passage" alanını null bırak.
- "text" alanına asla passage metnini yazma; "text" sadece soru cümlesini içermeli.
- 4 şıklı sorularda E alanını null bırak.
- Cevap anahtarı PDF'in SON sayfasındadır. Her sorunun "answer" alanına doğru şık harfini (A–E) yaz.
- Soruları numara sırasına göre küçükten büyüğe sırala.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

{"questions":[{"number":1,"passage":null,"text":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":null},"answer":"A"},{"number":2,"passage":null,"text":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":null},"answer":"B"}]}`;

// ---- 1b) Kategoriye göre yeni soru üretme promptu (AI Soru Havuzu) ----

export function buildGeneratePrompt(type, category, count = 10) {
  const label = type === "yds" ? "YDS" : "YÖKDİL";
  return `${count} adet orijinal ${label} tarzı, "${category}" kategorisinde İngilizce çoktan seçmeli soru üret.

Kurallar:
- Gerçek sınavdaki zorluk seviyesi ve formatına uygun olsun, sorular birbirinin tekrarı olmasın.
- Her soru 4 veya 5 şıklı olsun (4 şıklıysa "options" içindeki E alanını null bırak).
- "${category}" kategorisine uygun soru tipini kullan (örn. okuma parçası gerektiren bir kategoriyse ilgili sorulara ortak bir "passage" ekle, kelime/dil bilgisi gibi parçasız kategorilerde "passage" alanını null bırak).
- Soru metni ve şıkları TAM, ORİJİNAL İngilizce haliyle yaz. Çevirme, kısaltma yapma.
- "text" alanına asla passage metnini yazma; "text" sadece soru cümlesini içermeli.
- "answer" alanına doğru şık harfini (A–E) yaz.
- "number" alanına 1'den başlayarak sırayla numara ver.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

{"questions":[{"number":1,"passage":null,"text":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":null},"answer":"A"},{"number":2,"passage":null,"text":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":null},"answer":"B"}]}`;
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

ÖNEMLİ FORMAT KURALI: meaning_tr ve distractors_tr'nin dördü de AYNI biçimde
yazılmalı — hepsi kısa ve tek bir ifade (1-3 kelime), hiçbirinde parantez
içi açıklama, virgülle sıralanmış alternatif anlam ya da ekstra not
olmamalı. Amaç: doğru cevabı sadece yazım biçiminden (uzunluk, parantez,
virgül farkı) ayırt etmek mümkün olmasın, sadece anlamı bilerek seçilsin.

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

// ---- 4) Mevcut kelimelerin şık formatını düzeltme (tek seferlik bakım) ----

const reformatSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    meaning_tr: { type: Type.STRING },
    distractors_tr: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["word", "meaning_tr", "distractors_tr"],
};

export async function reformatWords({ apiKey, model, words }) {
  const ai = getAI(apiKey);
  const list = words
    .map(
      (w, i) =>
        `${i + 1}. word: "${w.word}" | meaning_tr: "${w.meaning_tr}" | distractors_tr: ${JSON.stringify(w.distractors_tr)}`
    )
    .join("\n");
  const prompt = `Aşağıda kelime oyunu için kelime + doğru anlam + 3 yanlış anlam (distractor) listesi var.
Sorun: bazılarında doğru cevap (meaning_tr) ile yanlış şıklar (distractors_tr) farklı
biçimde yazılmış (biri parantezli, biri virgüllü, biri daha uzun/kısa) — bu da
doğru cevabı anlamı bilmeden, sadece yazım biçiminden tahmin etmeyi kolaylaştırıyor.

Görevin: her kelime için meaning_tr ve distractors_tr'nin DÖRDÜNÜ de aynı kısa
biçimde yeniden yaz (1-3 kelime, parantez yok, virgülle sıralama yok). Anlamları
DEĞİŞTİRME, sadece biçimlerini eşitle. word alanını olduğu gibi geri döndür.

Kelimeler:
${list}

Sırayı koruyarak, girdiyle aynı sayıda eleman içeren bir JSON dizisi döndür.`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: reformatSchema },
    },
  });
  return JSON.parse(textOf(response));
}
