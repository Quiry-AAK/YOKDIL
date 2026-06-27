export const YOKDIL_CATS = [
  { label: "Kelime Bilgisi", min: 1, max: 6 },
  { label: "Dil Bilgisi", min: 7, max: 20 },
  { label: "Cloze Test", min: 21, max: 30 },
  { label: "Cümle Tamamlama", min: 31, max: 41 },
  { label: "İng→Türkçe Çeviri", min: 42, max: 47 },
  { label: "Türkçe→İng Çeviri", min: 48, max: 53 },
  { label: "Paragraf Tamamlama", min: 54, max: 59 },
  { label: "Anlam Bütünlüğü", min: 60, max: 65 },
  { label: "Okuduğunu Anlama", min: 66, max: 80 },
];

export const YDS_CATS = [
  { label: "Kelime Bilgisi", min: 1, max: 6 },
  { label: "Dil Bilgisi", min: 7, max: 16 },
  { label: "Cloze Test", min: 17, max: 26 },
  { label: "Cümle Tamamlama", min: 27, max: 36 },
  { label: "Çeviri", min: 37, max: 42 },
  { label: "Okuma Parçaları", min: 43, max: 62 },
  { label: "Diyalog Tamamlama", min: 63, max: 67 },
  { label: "Anlamca En Yakın Cümle", min: 68, max: 71 },
  { label: "Paragraf Tamamlama", min: 72, max: 75 },
  { label: "Anlam Bütünlüğü", min: 76, max: 80 },
];

export const CAT_ORDER = [
  "Kelime Bilgisi", "Dil Bilgisi", "Cloze Test", "Cümle Tamamlama",
  "İng→Türkçe Çeviri", "Türkçe→İng Çeviri", "Çeviri",
  "Paragraf Tamamlama", "Anlam Bütünlüğü",
  "Okuduğunu Anlama", "Okuma Parçaları",
  "Diyalog Tamamlama", "Anlamca En Yakın Cümle", "Diğer",
];

export function getCategory(num, type) {
  const cats = type === "yds" ? YDS_CATS : YOKDIL_CATS;
  return cats.find((c) => num >= c.min && num <= c.max)?.label ?? "Diğer";
}
