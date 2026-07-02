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
    ],
    examples: [
      { en: "Although he was tired, he kept working.", tr: "Yorgun olmasına rağmen çalışmaya devam etti." },
      { en: "Despite being tired, he kept working.", tr: "Yorgun olmasına rağmen çalışmaya devam etti." },
    ],
    pitfalls: [
      "Although/despite karışıklığı: boşluktan sonra özne+fiil mi isim öbeği mi geldiğine bakmadan seçim yapmak",
      "because + isim öbeği veya because of + özne+fiil gibi ters kullanım",
      "so that (amaç) ile so...that (sonuç) kalıplarını birbirine karıştırmak",
      "whereas/while ile although'u aynı şeymiş gibi kullanmak — whereas daha çok karşılaştırma, although daha çok zıtlık bildirir",
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
    pitfalls: [
      "No sooner...than yerine when/before kullanmak — bu kalıp sadece than ile çalışır",
      "Hardly...when yerine than kullanmak — kalıplar birbirinin yerine geçmez",
      "Devrik yapının sadece ilk cümlecikte kaldığını unutup ikinci cümleciği de devrik kurmak (Not only...but also'da but also kısmı normal kalır)",
      "Cümle başındaki zarfı fark edip yardımcı fiili öne almayı unutmak (Never I have seen gibi yanlış sıralama)",
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
    pitfalls: [
      "unless ile birlikte ikinci bir olumsuzluk kullanmak (unless...not gibi çifte olumsuzluk)",
      "Type 2 ve Type 3'ün fiil zamanlarını karıştırmak (if + past perfect yerine if + past kullanmak)",
      "Mixed conditional'da ana cümle ile şart cümleciğinin zamanını birbirine uydurmaya çalışmak — mixed'de iki farklı zaman bilinçli olarak bir aradadır",
      "Ana cümlede would yerine will kullanmak (Type 2/3'te will kullanılmaz)",
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
    pitfalls: [
      "Özne eylemi yapmıyorken aktif yapı kurmak (cümlenin öznesinin eylemden etkilenen taraf olduğunu fark etmemek)",
      "Modal + passive kalıbında be fiilini unutmak (must done yerine must be done olmalı)",
      "Causative yapıda \"have something done\" yerine \"have do something\" gibi yanlış sıralama kullanmak",
      "Passive cümlede zamanı be fiiline değil ana fiile yansıtmaya çalışmak",
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
    pitfalls: [
      "must have (kesin çıkarım) ile should have (pişmanlık/eleştiri) anlamını birbirine karıştırmak",
      "Geçmiş modal kalıbında V3 yerine V1 kullanmak (must have go yerine must have gone olmalı)",
      "needn't have done (gereksiz yapılmış) ile didn't need to do (gerekli değildi, yapılmadı) anlamlarını karıştırmak",
      "can't have done (imkânsız geçmiş tahmini) yerine mustn't have done gibi olmayan bir kalıp kurmak",
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
    pitfalls: [
      "Virgüllü (non-defining) cümlecikte that kullanmak — bu kalıpta that asla kullanılmaz",
      "İyelik ilişkisi arandığında whose yerine who/which kullanmak",
      "Kişi için which, nesne için who kullanmak gibi tür karışıklığı",
      "Defining/non-defining ayrımını virgüle bakmadan tahmin etmeye çalışmak",
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
    pitfalls: [
      "Zaman kaydırmayı (backshift) unutup direkt orijinal zamanı kullanmak",
      "Dolaylı soruda devrik yapıyı koruyup yardımcı fiili öne almaya devam etmek (asked where did I live gibi yanlış)",
      "Zaman/yer zarflarını değiştirmeyi unutmak (tomorrow'u the next day yapmadan bırakmak)",
      "Emir cümlesini that-clause ile çevirmeye çalışmak; doğrusu told/asked + to V kalıbıdır",
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
    pitfalls: [
      "wh-clause içinde soru cümlesi sırasını korumak (I don't know why did she leave gibi yanlış)",
      "that-clause'u gereksiz yere that olmadan bırakıp cümleyi belirsizleştirmek (bazı bağlamda that atlanabilir ama sınavda net kullanım aranır)",
      "Noun clause'un cümledeki görevini (özne mi nesne mi) karıştırmak",
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
    pitfalls: [
      "Sarkan ortaç (dangling participle): ortacın öznesiyle ana cümlenin öznesinin uyuşmaması — gramatik olarak hatalı ama anlam \"makul\" göründüğü için sık seçilir",
      "-ing (aktif) ile -ed/V3 (pasif) formunu birbirine karıştırmak",
      "Ortaç cümleciğinin hangi zaman/sebep/koşul cümleciğinin kısaltılmış hâli olduğunu yanlış çıkarmak",
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
    pitfalls: [
      "since ile birlikte present perfect yerine simple past kullanmak (I have known him since... yerine I knew him since... gibi yanlış)",
      "for/since'i birbirine karıştırmak — for süre, since başlangıç noktası bildirir",
      "Belirli bir geçmiş zaman ifadesi (in 2005, yesterday) varken present perfect kullanmak",
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
    pitfalls: [
      "Çift comparative kullanmak (more bigger, more better gibi)",
      "than yerine from/that kullanmak (bigger from him yerine bigger than him olmalı)",
      "the + comparative...the + comparative kalıbında \"the\"yı atlamak",
      "as...as kalıbı arasına sıfatın yanlış hâlini (comparative/superlative) koymak",
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
    pitfalls: [
      "wish'ten sonra will kullanmak — doğrusu would'tur (I wish you will stop yanlış)",
      "Şimdiki zamana ait bir dilek için past perfect, geçmişe ait bir pişmanlık için sadece past simple kullanmak (zamanları ters kullanmak)",
      "wish + would kalıbını kendi isteklerimiz için kullanmak — bu kalıp başkasının davranışından rahatsızlık içindir, \"I wish I would...\" doğal değildir",
    ],
  },
  {
    id: "used-to",
    title: "Used to / Be used to / Get used to",
    points: [
      "used to + V → geçmişteki alışkanlık, artık yok (I used to smoke.)",
      "be used to + V-ing → bir şeye alışkın olmak (I am used to waking up early.)",
      "get used to + V-ing → bir şeye alışmaya başlamak (I am getting used to the new job.)",
    ],
    pitfalls: [
      "used to'yu şimdiki zamanda kullanmaya çalışmak (I use to smoke gibi hatalı kullanım) — sadece geçmiş için geçerlidir",
      "be used to / get used to kalıplarından sonra V-ing yerine yalın fiil (V1) kullanmak",
      "used to (geçmiş alışkanlık) ile be used to (alışkın olmak) anlamlarını karıştırmak — biri eylem biri durum bildirir",
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
    pitfalls: [
      "so ile such'ı karıştırmak: so'dan sonra isim gelmez (so a good book yanlış, such a good book doğru)",
      "such kalıbında a/an'in sırasını yanlış koymak (a such good book yerine such a good book olmalı)",
      "enough'ın sıfattan önce mi sonra mı geldiğini karıştırmak — enough sıfattan SONRA gelir (enough old değil, old enough)",
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
    pitfalls: [
      "Sadece gerund alan bir fiilden sonra infinitive kullanmak (enjoy to swim yanlış, enjoy swimming doğru)",
      "stop to V / stop V-ing anlam farkını fark etmeden rastgele seçmek",
      "remember/forget/try gibi çift anlamlı fiillerde cümledeki bağlamı göz ardı edip ezbere gerund ya da infinitive seçmek",
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
    pitfalls: [
      "Türkçe düşünüp edatı mantıkla tahmin etmeye çalışmak (interested about gibi yanlış, doğrusu interested in)",
      "result in / result from gibi yön farkı olan kalıpları karıştırmak",
      "Aynı fiilin farklı edatlarla farklı anlam kazandığını fark etmemek",
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
    pitfalls: [
      "look forward to'dan sonra V1 kullanmak (look forward to see yanlış, look forward to seeing doğru)",
      "Phrasal verb'ün anlamını parçalardan (kelime kelime) çıkarmaya çalışmak — çoğu zaman yanıltıcıdır",
      "Ayrılabilir (separable) phrasal verb'lerde zamiri doğru yere koymamak (give up it yanlış, give it up doğru)",
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
