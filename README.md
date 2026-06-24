# YÖKDİL / YDS Asistanı

PDF deneme yükle → AI soruları sırasını bozmadan çıkarsın → tek tek çöz → cevap
anahtarından kontrol → yanlışlar panele düşsün (AI açıklamalı) → yanlışları
tekrar çöz → işaretlediğin kelimeleri oyunla öğren.

## PC'de Çalıştırma (test)

```bash
npm install
npm run dev
```

Tarayıcıda **http://localhost:5173** aç.

İlk kullanımda **Ayarlar** ekranına **ücretsiz Google Gemini** API anahtarını
gir (`AIza...`). Anahtar **aistudio.google.com/apikey** adresinden, ödeme/kart
gerekmeden alınır.

## Özellikler

- **Denemeler:** PDF yükle, AI tüm soruları + son sayfadaki cevap anahtarını çıkarır.
- **Çözüm:** Sorular sırayla gelir; cevaplayınca doğru/yanlış anında gösterilir.
- **Yanlışlarım:** Yanlış sorular AI açıklamasıyla burada (neden bu cevap).
- **Tekrar Çöz:** Yanlışları ağırlıklı rastgele döndürür — çok görüp doğru
  yaptıkların seyrekleşir, takıldıkların sık gelir (aralıklı tekrar).
- **Kelimeler:** Soru çözerken İngilizce kelimeye dokun → anlam + tür
  (isim/sıfat/fiil) + örnek cümle ile kaydedilir. Kelime oyununda şıklı sorulur,
  aynı algoritma uygulanır.
- Birden fazla deneme; tüm yanlışlar ve kelimeler ortak panellerde toplanır.
- Tüm veriler tarayıcıda/cihazda (localStorage) saklanır.

## Veri & Maliyet

- AI: **Google Gemini** (ücretsiz katman). Ödeme gerekmez; sadece dakika/gün
  başına istek limiti vardır. Bir denemeyi okumak tek istektir.
- API anahtarı ve tüm ilerleme cihazda saklanır (localStorage), dışarı gitmez.
- PDF bir kez okunur ve sonuç kaydedilir; tekrar tekrar API'ye gidilmez.
- Model Ayarlar'dan seçilir: Gemini 2.5 Flash (varsayılan), 2.5 Flash-Lite, 2.0 Flash.
- Not: Gemini ücretsiz katmanda veriyi ürün geliştirmede kullanabilir (deneme
  PDF'i hassas veri değildir).

## Telefona Kurma (PWA — en hızlı, ücretsiz)

Uygulama kurulabilir bir PWA'dır. Telefonda gerçek uygulama gibi (ikon + tam
ekran) çalışır, çevrimdışı bile açılır.

1. `npm run build` ile derle → `dist` klasörü oluşur.
2. Bilgisayarda **app.netlify.com/drop** adresini aç.
3. **dist** klasörünü sayfaya sürükle-bırak → sana `https://...netlify.app` linki verir.
4. Telefonda bu linki **Chrome** ile aç.
5. Chrome menüsü (⋮) → **"Uygulamayı yükle" / "Ana ekrana ekle"**.
6. Ana ekranda ikon oluşur; aç, **Ayarlar**'dan Gemini anahtarını gir.

> Netlify Drop geçici link verir; kalıcı olması için ücretsiz Netlify hesabı aç
> (kart gerekmez). GitHub Pages / Vercel de olur.
>
> Not: Her cihazın kendi verisi vardır (localStorage). Telefonda anahtarı ve
> denemeleri yeniden eklemen gerekir; PC ile telefon arası senkron yoktur.

## (İleride) Gerçek APK

Projede `android/` (Capacitor) klasörü hazır. Gerçek `.apk` için Android Studio
kurup `npx cap sync android` sonrası Studio'dan "Build APK" yeterli.
