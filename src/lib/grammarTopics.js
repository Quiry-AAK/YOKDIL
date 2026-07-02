// Dil bilgisi konu özetleri + genel sınav taktikleri — sadece anlatım, quiz yok.

export const GRAMMAR_TOPICS = [
  {
    id: "connectors",
    title: "Bağlaçlar (Connectors)",
    points: [
      "although / though / even though + ÖZNE+FİİL, ama despite / in spite of + isim / -ing",
      "because + ÖZNE+FİİL, ama because of + isim / -ing",
      "so that / in order to → amaç bildirir; so + sıfat + that → sonuç bildirir",
      "therefore, thus, consequently, as a result → sonuç bağlaçları, genelde yeni cümle başında",
      "whereas / while → iki durumu karşılaştırıp zıtlık kurar",
      "Tuzak: boşluktan sonra isim mi fiil cümleciği mi geldiğine göre despite/although ayrımını yap.",
    ],
    examples: [
      { en: "Although he was tired, he kept working.", tr: "Yorgun olmasına rağmen çalışmaya devam etti." },
      { en: "Despite being tired, he kept working.", tr: "Yorgun olmasına rağmen çalışmaya devam etti." },
    ],
  },
  {
    id: "inversion",
    title: "Devrik Cümle (Inversion)",
    points: [
      "Olumsuz/sınırlayıcı zarflar cümle başına gelince yardımcı fiil özneden önce gelir: Never, Rarely, Seldom, Hardly ever",
      "No sooner...than, Not only...but also, Only after/by/when, Under no circumstances de devrik yapı gerektirir",
      "Not only devrik olur, but also kısmı normal kalır",
      "Şart cümlelerinde de devrik kullanım olur: Had I known, Were it not for, Should you need help",
    ],
    examples: [
      { en: "Never have I seen such a mess.", tr: "Hiç böyle bir dağınıklık görmedim." },
      { en: "Not only did she win, but she also broke the record.", tr: "Sadece kazanmakla kalmadı, rekoru da kırdı." },
    ],
  },
  {
    id: "conditionals",
    title: "Şart Cümleleri (Conditionals)",
    points: [
      "Type 1 (gerçek/olası): If + present, ... will + V",
      "Type 2 (şimdi gerçek dışı): If + past, ... would + V",
      "Type 3 (geçmişte gerçekleşmemiş): If + past perfect, ... would have + V3",
      "Mixed: geçmişteki şart → şimdiki sonuç: If + past perfect, ... would + V",
      "unless = if...not; aynı cümlede iki olumsuzluk birden kullanılmaz",
      "Devrik şart: Had it not been for..., Were it not for...",
    ],
    examples: [
      { en: "If I had studied harder, I would be a doctor now.", tr: "Daha çok çalışsaydım şimdi doktor olurdum. (mixed)" },
    ],
  },
  {
    id: "passive",
    title: "Edilgen Çatı (Passive Voice)",
    points: [
      "be + V3 yapısı, zaman be fiiline yansır (is done, was done, has been done...)",
      "Modal + passive: must be done, should have been done",
      "Causative (yaptırma): have/get something done",
      "Cümlede özne eylemi kendisi yapmıyorsa, ya da eylemi yapan önemsizse passive tercih edilir",
      "\"by + agent\" ifadesi passive cümlede eylemi yapanı gösterir",
    ],
    examples: [
      { en: "The report must be submitted by Friday.", tr: "Rapor cumaya kadar teslim edilmelidir." },
      { en: "She had her car repaired.", tr: "Arabasını tamir ettirdi." },
    ],
  },
  {
    id: "modals",
    title: "Modal Fiiller (Modals)",
    points: [
      "Şimdi/gelecek yeterlilik-izin-zorunluluk: can, could, may, might, must, should, have to",
      "Geçmişe yönelik kesin tahmin: must have + V3",
      "Geçmişe yönelik ihtimal: might/could have + V3",
      "Geçmişe yönelik pişmanlık/eleştiri: should have + V3 (yapılmadı, yapılmalıydı)",
      "Gereksiz yapılmış eylem: needn't have + V3",
      "İmkânsız geçmiş tahmini: can't have + V3",
    ],
    examples: [
      { en: "You shouldn't have said that.", tr: "Bunu söylememeliydin. (söyledi ama yanlış yaptı)" },
      { en: "He can't have finished already.", tr: "Bu kadar çabuk bitirmiş olamaz." },
    ],
  },
  {
    id: "relative",
    title: "İlgi Cümlecikleri (Relative Clauses)",
    points: [
      "who/whom → kişi, which → nesne/hayvan, whose → iyelik, where → yer, when → zaman",
      "that → hem kişi hem nesne için kullanılır, ama virgülden sonra ASLA kullanılmaz",
      "Defining (virgülsüz) → cümle için gerekli bilgi; non-defining (virgüllü) → ek/çıkarılabilir bilgi",
      "Non-defining cümlecikte that kullanılamaz, who/which kullanılır",
    ],
    examples: [
      { en: "The book, which I bought yesterday, is great.", tr: "Dün aldığım kitap harika. (non-defining, ek bilgi)" },
    ],
  },
  {
    id: "reported",
    title: "Dolaylı Anlatım (Reported Speech)",
    points: [
      "Zaman bir kademe geriye kayar: present→past, will→would, can→could, present perfect→past perfect",
      "Zaman/yer zarfları değişir: now→then, here→there, tomorrow→the next day, yesterday→the day before",
      "Soru cümlesinde yardımcı fiil düşer, düz cümle sırasına döner (devrik kalmaz)",
      "Emir cümlesi: told/asked + kişi + to V (olumsuzda not to V)",
    ],
    examples: [
      { en: "She asked where I lived.", tr: "Nerede yaşadığımı sordu. (soru sırası bozulmadan düz cümleye döner)" },
    ],
  },
  {
    id: "noun-clauses",
    title: "İsim Cümlecikleri (Noun Clauses)",
    points: [
      "that-clause özne veya nesne olarak kullanılabilir: That he lied surprised everyone.",
      "wh-clauses (what/who/where/why/how) + düz cümle sırasıyla devam eder, soru sırası bozulmaz",
      "Noun clause bir cümlenin öznesi, nesnesi ya da tümleci olabilir",
    ],
    examples: [
      { en: "I don't know why she left early.", tr: "Neden erken ayrıldığını bilmiyorum." },
    ],
  },
  {
    id: "participle",
    title: "Ortaç Yapıları (Participle Clauses)",
    points: [
      "-ing (aktif anlam, eşzamanlılık/sebep): Feeling tired, she went to bed.",
      "-ed / V3 (pasif anlam): Written in 1990, the book became a classic.",
      "Zaman, sebep veya koşul cümleciklerinin kısaltılmış (indirgenmiş) hâlidir",
      "Ana cümlenin öznesiyle ortaç cümleciğinin öznesi aynı olmalıdır (aksi hâlde sarkan ortaç hatası olur)",
    ],
    examples: [
      { en: "Having finished his homework, he went out to play.", tr: "Ödevini bitirdikten sonra oynamaya çıktı." },
    ],
  },
  {
    id: "tense",
    title: "Zaman Uyumu (Tense Agreement)",
    points: [
      "Present Perfect: belirsiz zaman / süreklilik / geçmişten şimdiye etkisi süren durum",
      "Past Simple: net, belirli bir geçmiş zaman noktası",
      "since + belirli zaman noktası, for + süre ifadesi; genelde present perfect ile kullanılır",
      "Bir cümlede zaman zarfları (yesterday, last year, in 2005 gibi) genelde simple past ister",
    ],
    examples: [
      { en: "I have known him since he was a child.", tr: "Onu çocukluğundan beri tanırım." },
      { en: "I met him in 2005.", tr: "Onunla 2005'te tanıştım." },
    ],
  },
  {
    id: "comparison",
    title: "Karşılaştırma Yapıları (Comparatives)",
    points: [
      "the + comparative..., the + comparative... → \"Ne kadar çok..., o kadar çok...\"",
      "as...as (eşitlik), not as/so...as (eşit olmama)",
      "Çift comparative kullanılmaz (more bigger yanlış, bigger doğru)",
      "the + superlative + kıyaslanan grup (the most interesting book I've ever read)",
    ],
    examples: [
      { en: "The more you practice, the better you get.", tr: "Ne kadar çok pratik yaparsan o kadar iyi olursun." },
    ],
  },
  {
    id: "wish",
    title: "Wish / If Only",
    points: [
      "Şimdiki durumdan memnuniyetsizlik: wish + past simple (I wish I knew the answer.)",
      "Geçmişe pişmanlık: wish + past perfect (I wish I had studied more.)",
      "Birinin davranışından rahatsızlık / değişim isteği: wish + would (I wish you would stop shouting.)",
    ],
    examples: [
      { en: "I wish I had listened to my parents.", tr: "Keşke aileme kulak verseydim." },
    ],
  },
  {
    id: "used-to",
    title: "Used to / Be used to / Get used to",
    points: [
      "used to + V → geçmişteki alışkanlık, artık yok (I used to smoke.)",
      "be used to + V-ing → bir şeye alışkın olmak (I am used to waking up early.)",
      "get used to + V-ing → bir şeye alışmaya başlamak (I am getting used to the new job.)",
      "Tuzak: \"used to\" şimdiki zamanda kullanılmaz, sadece geçmiş alışkanlık için geçerlidir",
    ],
  },
  {
    id: "so-such-too-enough",
    title: "So/Such + That, Too/Enough",
    points: [
      "so + sıfat/zarf + that → sonuç cümleciği (so tired that...)",
      "such + (a/an) + sıfat + isim + that → sonuç cümleciği (such a good book that...)",
      "too + sıfat + to V → olumsuz sonuç (too young to drive)",
      "sıfat + enough + to V → yeterlilik (old enough to drive)",
    ],
  },
  {
    id: "gerund-infinitive",
    title: "Gerund / Infinitive",
    points: [
      "Sadece gerund alan fiiller: enjoy, avoid, mind, suggest, consider, admit, finish, deny",
      "Sadece infinitive alan fiiller: want, decide, plan, promise, afford, manage, agree, refuse",
      "stop to V (bir şey yapmak için durmak) ≠ stop V-ing (bir şeyi yapmayı bırakmak)",
      "remember to V (yapacağını hatırlamak) ≠ remember V-ing (yaptığını hatırlamak)",
      "try to V (çabalamak) ≠ try V-ing (denemek, bir yöntemi sınamak)",
    ],
  },
  {
    id: "prep-verbs",
    title: "Fiil + Edat Kalıpları (Prepositional Verbs)",
    points: [
      "Sık çıkanlar: depend on, consist of, result in, result from, insist on, succeed in, believe in, apply for, deal with, care for/about",
      "Edat genelde anlamdan çıkarılamaz, kalıp olarak ezberlenmesi gerekir",
      "Aynı fiil farklı edatla farklı anlam kazanabilir: result in (bir şeyle sonuçlanmak) / result from (bir şeyden kaynaklanmak)",
    ],
  },
  {
    id: "phrasal-verbs",
    title: "Phrasal Verbs (Deyimsel Fiiller)",
    points: [
      "Sık çıkanlar: come up with (bulmak/önermek), put up with (katlanmak), look forward to (dört gözle beklemek), carry out (yürütmek), come across (rastlamak), take over (devralmak), give up (vazgeçmek), run out of (tükenmek)",
      "look forward to + V-ing alır, to burada edattır infinitive değil",
      "Anlamı parçalardan çıkarılamaz, kalıp olarak öğrenilmelidir",
    ],
  },
];

export const GENERAL_TIPS = [
  "Zamanı iyi yönet: zor sorulara takılıp kalma, işaretle ve devam et, sona kalırsan geri dön.",
  "Kelime bilmediğin sorularda gramer ipuçlarından yararlan (fiil türü, edat, zaman).",
  "Okuma parçalarını en sona bırakma — en çok soru orada (YÖKDİL'de 15, YDS'de 20 soru).",
  "Şıkları elemeye çalış, kesin yanlış olanları hemen çıkar, ihtimalleri daralt.",
  "Emin olmadığın soruyu boş bırakma — puanlama sadece doğru sayısına göre yapılır (doğru × 1,25), yanlış cevap doğruyu götürmez.",
  "Sık çıkan kalıp yapıları (bağlaç + yapı) pratikle otomatik tanır hâle gel, sınavda düşünmeden fark et.",
  "Aşırı genelleme içeren şıklara (always, never, all, completely) şüpheyle yaklaş — genelde tuzaktır.",
  "Cümleyi/parçayı sonuna kadar okumadan erken karar verme, sondaki bir ifade cevabı değiştirebilir.",
];
