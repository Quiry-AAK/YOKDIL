// Dil bilgisi konu özetleri + sinyal kelime haritası — sadece anlatım, quiz yok.

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
      "❌ Despite he was tired... → ✅ Despite being tired... (despite'tan sonra özne+fiil gelmez, isim/-ing gelir)",
      "❌ Because of he was late... → ✅ Because he was late... (because of'tan sonra isim/-ing gelir, özne+fiil gelmez)",
      "so that (amaç) ile so...that (sonuç) kalıplarını birbirine karıştırmak — so that'ten önce virgül yoktur, amaç bildirir",
      "whereas/while ile although'u aynı şeymiş gibi kullanmak — whereas daha çok karşılaştırma, although daha çok zıtlık bildirir",
      "therefore/however gibi bağlaçları cümle ortasında bağlaç gibi kullanmak — bunlar genelde noktalı virgül veya nokta ile ayrılan yeni cümle başında kullanılır, and/but gibi doğrudan bağlamaz",
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
      "❌ No sooner had the plane landed when... → ✅ ...than... (No sooner...than sabit kalıptır, when/before ile kullanılmaz)",
      "❌ Hardly had she arrived than... → ✅ ...when... (Hardly...when sabit kalıptır, than ile kullanılmaz)",
      "Devrik yapının sadece ilk cümlecikte kaldığını unutup ikinci cümleciği de devrik kurmak (Not only...but also'da but also kısmı normal kalır)",
      "❌ Never I have seen... → ✅ Never have I seen... (zarfı fark edip yardımcı fiili özneden önce almayı unutmak)",
      "Only after / Only when / Only by ile başlayan cümlelerde devrikliği unutup düz cümle sırasına dönmek",
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
      "❌ Unless you don't hurry... → ✅ Unless you hurry... (unless zaten olumsuzluk taşır, ikinci bir \"not\" eklenmez)",
      "❌ If he had more time, he would have finished. → ✅ If he had had more time... (Type 2/3 fiil zamanlarını karıştırmak)",
      "Mixed conditional'da ana cümle ile şart cümleciğinin zamanını birbirine uydurmaya çalışmak — mixed'de iki farklı zaman bilinçli olarak bir aradadır",
      "❌ If it rains, we will canceled. → ✅ ...we will cancel. (Type 1'de ana cümlede will + V1 kullanılır, will + V3 değil)",
      "provided that / as long as / on condition that gibi \"if\" yerine geçen koşul bağlaçlarını tanımamak",
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
      "❌ The report must submitted. → ✅ The report must be submitted. (modal + passive'te be fiilini atlamak)",
      "❌ She had repaired her car (yaptırma anlamı kastediliyorsa). → ✅ She had her car repaired. (causative sıralamasını karıştırmak: have + nesne + V3)",
      "Özne eylemi yapmıyorken aktif yapı kurmak (cümlenin öznesinin eylemden etkilenen taraf olduğunu fark etmemek)",
      "Passive cümlede zamanı be fiiline değil ana fiile yansıtmaya çalışmak (was being written yerine was write gibi hatalar)",
      "\"by + agent\" görülmese bile pasif yapının gerekli olabileceğini unutmak — agent çoğu zaman cümlede belirtilmez",
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
      "❌ must have go → ✅ must have gone (geçmiş modal kalıbında V3 yerine V1 kullanmak)",
      "needn't have done (gereksiz yapılmış) ile didn't need to do (gerekli değildi, muhtemelen yapılmadı) anlamlarını karıştırmak",
      "❌ mustn't have done → ✅ can't have done (imkânsız geçmiş tahmini için mustn't değil can't kullanılır)",
      "could have done (geçmişte yapılabilirdi ama yapılmadı) ile was able to do (geçmişte gerçekten yapabildi) ayrımını gözden kaçırmak",
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
      "❌ The bridge, that was built in 1930... → ✅ ...which was built... (virgüllü/non-defining cümlecikte that asla kullanılmaz)",
      "İyelik ilişkisi arandığında whose yerine who/which kullanmak",
      "Kişi için which, nesne için who kullanmak gibi tür karışıklığı",
      "Defining/non-defining ayrımını virgüle bakmadan tahmin etmeye çalışmak",
      "Relative clause içinde gereksiz özne tekrarı yapmak (the man who he called... → the man who called...)",
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
      "❌ She asked where did I live. → ✅ She asked where I lived. (dolaylı soruda devrik yapıyı korumak)",
      "Zaman/yer zarflarını değiştirmeyi unutmak (tomorrow'u the next day yapmadan bırakmak)",
      "Emir cümlesini that-clause ile çevirmeye çalışmak; doğrusu told/asked + to V kalıbıdır",
      "Genel geçerlere (değişmeyen gerçekler) rağmen zamanı yine de kaydırmak — bazı bağlamlarda present kalabilir, ama sınavda genelde backshift beklenir",
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
      "❌ I don't know why did she leave. → ✅ I don't know why she left. (wh-clause içinde soru sırasını korumak)",
      "that-clause'u gereksiz yere that olmadan bırakıp cümleyi belirsizleştirmek",
      "Noun clause'un cümledeki görevini (özne mi nesne mi) karıştırmak",
      "whether/if ile kurulan noun clause'larda \"or not\" gerekip gerekmediğini karıştırmak",
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
      "Having + V3 (tamamlanmış eylem) ile şimdiki zamana ait basit -ing yapısını karıştırmak",
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
      "❌ I have known him since he is a child. → ✅ ...since he was a child. (since'ten sonraki cümlecik genelde simple past'tir, ana cümle present perfect kalır)",
      "for/since'i birbirine karıştırmak — for süre, since başlangıç noktası bildirir",
      "Belirli bir geçmiş zaman ifadesi (in 2005, yesterday) varken present perfect kullanmak",
      "Present Perfect Continuous ile Present Perfect Simple arasındaki süreklilik/sonuç vurgusu farkını gözden kaçırmak",
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
      "❌ more bigger / more better → ✅ bigger / better (çift comparative kullanmak)",
      "❌ bigger from him → ✅ bigger than him (than yerine from/that kullanmak)",
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
      "❌ I wish you will stop. → ✅ I wish you would stop. (wish'ten sonra will değil would kullanılır)",
      "Şimdiki zamana ait bir dilek için past perfect, geçmişe ait bir pişmanlık için sadece past simple kullanmak (zamanları ters kullanmak)",
      "wish + would kalıbını kendi isteklerimiz için kullanmak — bu kalıp başkasının davranışından rahatsızlık içindir",
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
      "❌ I use to smoke. → ✅ I used to smoke. (used to'yu şimdiki zamanda kullanmaya çalışmak — sadece geçmiş için geçerlidir)",
      "❌ be used to do → ✅ be used to doing (be used to / get used to kalıplarından sonra V-ing gerekir, yalın fiil değil)",
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
      "❌ so a good book that → ✅ such a good book that (so'dan sonra isim gelmez, such kullanılır)",
      "❌ a such good book → ✅ such a good book (a/an'in sırasını yanlış koymak)",
      "❌ enough old → ✅ old enough (enough sıfattan SONRA gelir)",
      "too + sıfat + to V kalıbının olumsuz bir sonuç (yapamama) bildirdiğini unutup olumlu bağlamda kullanmak",
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
      "❌ enjoy to swim → ✅ enjoy swimming (sadece gerund alan bir fiilden sonra infinitive kullanmak)",
      "❌ decide swimming → ✅ decide to swim (sadece infinitive alan bir fiilden sonra gerund kullanmak)",
      "stop to V / stop V-ing anlam farkını fark etmeden rastgele seçmek",
      "remember/forget/try gibi çift anlamlı fiillerde cümledeki bağlamı göz ardı edip ezbere gerund ya da infinitive seçmek",
      "Edattan sonra gelen fiili infinitive yapmak — edattan sonra HER ZAMAN gerund gelir (interested in study → interested in studying)",
    ],
  },
];

// Sinyal kelime → beklenen yapı haritası. Sınavda boşluktan önce/sonra
// bu kelimelerden birini görünce hangi yapının arandığını hızlıca hatırlatır.
export const SIGNAL_WORDS = [
  {
    group: "Zaman Sinyalleri",
    items: [
      { signal: "yesterday, last night/week/year, ... ago, in 1990 gibi geçmiş yıl", structure: "Simple Past (V2) — belirli, bitmiş bir geçmiş zaman noktası." },
      { signal: "recently, lately, just, already, yet, so far, up to now, over the last/past + süre", structure: "Present Perfect (have/has + V3) — net bir geçmiş zaman ifadesi yoksa." },
      { signal: "since + belirli zaman noktası (since 2010, since he was a child)", structure: "Present Perfect / Present Perfect Continuous — ana cümlede; \"since\" cümleciğinde genelde Simple Past." },
      { signal: "for + süre ifadesi (for two years, for a while)", structure: "Present Perfect (Continuous) — sürenin hâlâ devam ettiğini gösterir." },
      { signal: "now, right now, at the moment, at present, currently, Look!/Listen!", structure: "Present Continuous." },
      { signal: "always, usually, often, every day/week, generally, as a rule", structure: "Simple Present." },
      { signal: "by the time + Simple Past cümlesi", structure: "Diğer cümlede Past Perfect (had + V3) — ilk eylemin ondan önce tamamlandığını gösterir." },
      { signal: "by + gelecek zaman noktası (by 2030, by next year)", structure: "Future Perfect (will have + V3)." },
      { signal: "when / while / as + sürmekte olan eylem", structure: "Past Continuous (arka plan eylemi) + Simple Past (araya giren kısa eylem)." },
      { signal: "never...before, this/it is the first time (that)...", structure: "Present Perfect." },
      { signal: "tomorrow, next week/year, soon, in the near future", structure: "Future (will / be going to)." },
    ],
  },
  {
    group: "Şart Cümlesi Sinyalleri",
    items: [
      { signal: "if + Simple Present (şart cümleciğinde)", structure: "Ana cümlede will + V1 (Type 1 — gerçek/olası)." },
      { signal: "if + Simple Past (şart cümleciğinde)", structure: "Ana cümlede would + V1 (Type 2 — şimdi gerçek dışı)." },
      { signal: "if + had + V3 / Past Perfect (şart cümleciğinde)", structure: "Ana cümlede would have + V3 (Type 3 — geçmişte gerçekleşmemiş)." },
      { signal: "unless", structure: "= if...not; cümlede ikinci bir olumsuzluk KULLANILMAZ, fiil olumlu kalır." },
      { signal: "provided that, providing that, as long as, on condition that", structure: "if gibi koşul bildirir, genelde Simple Present ile kullanılır." },
    ],
  },
  {
    group: "Bağlaç Sinyalleri",
    items: [
      { signal: "although / though / even though", structure: "Sonrasında ÖZNE+FİİL (tam cümle) gelir." },
      { signal: "despite / in spite of", structure: "Sonrasında isim ya da -ing (fiilsi isim) gelir, ÖZNE+FİİL gelmez." },
      { signal: "because", structure: "Sonrasında ÖZNE+FİİL gelir." },
      { signal: "because of", structure: "Sonrasında isim / -ing gelir." },
      { signal: "so + sıfat/zarf + that", structure: "Sonuç cümleciği; boşluktan sonra isim YOKSA so kullanılır." },
      { signal: "such + (a/an) + sıfat + isim + that", structure: "Sonuç cümleciği; boşluktan sonra isim VARSA such kullanılır." },
      { signal: "not only...but also, no sooner...than, hardly...when, never/rarely/seldom (cümle başında)", structure: "Devrik cümle — yardımcı fiil özneden önce gelir." },
    ],
  },
  {
    group: "Edilgen Çatı Sinyalleri",
    items: [
      { signal: "by + failleyen kişi/nesne (by the committee, by scientists)", structure: "Muhtemelen edilgen (passive) yapı aranıyor — be + V3." },
      { signal: "Cümlede özne eylemi kendisi yapmıyor / eylemi yapan belirtilmemiş ya da önemsiz", structure: "Passive (be + V3) tercih edilir." },
      { signal: "must/should/can + fiil, ama özne eylemden etkileniyor", structure: "Modal + be + V3 (must be done, should be considered)." },
    ],
  },
  {
    group: "Özne-Fiil Uyumu Sinyalleri",
    items: [
      { signal: "neither...nor, either...or", structure: "Fiil, bağlaca EN YAKIN olan özneye göre çekimlenir." },
      { signal: "each of / every one of + çoğul isim", structure: "Fiil TEKİL olur (each, every tekillik bildirir)." },
      { signal: "the number of + çoğul isim", structure: "Fiil TEKİL olur (\"the number\" tekildir)." },
      { signal: "a number of + çoğul isim", structure: "Fiil ÇOĞUL olur (\"a number of\" = birçok, çoğul anlam taşır)." },
      { signal: "araya giren bir isim öbeği (of + isim, with + isim gibi)", structure: "Fiil, araya giren isme değil CÜMLENİN ASIL ÖZNESİNE göre çekimlenir." },
    ],
  },
];
