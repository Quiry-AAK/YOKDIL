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
      "By no stretch of the/one's imagination (\"hiçbir şekilde, akla hayale sığmaz biçimde\") cümle başına gelince de aynı olumsuz-zarf mantığıyla devrik yapar — \"imagination\"ı ne kadar zorlarsan zorla, o ihtimal yine de mümkün değil demektir",
    ],
    examples: [
      { en: "Never have I seen such a mess.", tr: "Hiç böyle bir dağınıklık görmedim." },
      { en: "Not only did she win, but she also broke the record.", tr: "Sadece kazanmakla kalmadı, rekoru da kırdı." },
      { en: "By no stretch of the imagination can this be called a success.", tr: "Bu, hiçbir şekilde (akla hayale sığmayacak ölçüde) başarı olarak adlandırılamaz." },
    ],
    pitfalls: [
      "❌ No sooner had the plane landed when... → ✅ ...than... (No sooner...than sabit kalıptır, when/before ile kullanılmaz)",
      "❌ Hardly had she arrived than... → ✅ ...when... (Hardly...when sabit kalıptır, than ile kullanılmaz)",
      "Devrik yapının sadece ilk cümlecikte kaldığını unutup ikinci cümleciği de devrik kurmak (Not only...but also'da but also kısmı normal kalır)",
      "❌ Never I have seen... → ✅ Never have I seen... (zarfı fark edip yardımcı fiili özneden önce almayı unutmak)",
      "Only after / Only when / Only by ile başlayan cümlelerde devrikliği unutup düz cümle sırasına dönmek",
      "❌ By no stretch of the imagination this can be... → ✅ ...can this be... (By no stretch of the imagination ile başlayan cümlede de yardımcı fiili özneden önce almayı unutmak)",
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
      "which/where ayrımı edata bağlıdır: cümledeki fiil bir edat istiyorsa (live IN, work AT, stay IN gibi) 'which' TEK BAŞINA yetmez — ya edat+which (in which) ya da doğrudan where kullanılır",
      "where = edat + which; yani 'in which' ile 'where' birbirinin yerine geçer, ama sadece 'which' (edatsız) o cümlede eksik/yanlış olur",
    ],
    examples: [
      { en: "The book, which I bought yesterday, is great.", tr: "Dün aldığım kitap harika. (non-defining, ek bilgi)" },
      { en: "The hotel where we stayed was excellent.", tr: "Kaldığımız otel mükemmeldi. (stay IN bir yeri gerektirir → where ya da in which)" },
      { en: "The hotel in which we stayed was excellent.", tr: "Yukarıdakiyle aynı anlam, sadece daha resmi." },
    ],
    pitfalls: [
      "❌ The bridge, that was built in 1930... → ✅ ...which was built... (virgüllü/non-defining cümlecikte that asla kullanılmaz)",
      "❌ The hotel which we stayed was excellent. → ✅ The hotel where we stayed... / The hotel in which we stayed... (fiil edat istiyorsa — stay IN — yalın which yetmez, edat eksik kalır)",
      "❌ The company which he works is well-known. → ✅ The company where he works... / ...which he works AT... (work AT edat ister; either edatı which'ten önce koy ya da where kullan, ikisini birden atlama)",
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
    title: "Ortaç Yapıları (Participle Clauses / Reduced Adverb Clause)",
    points: [
      "Bu yapı aslında bir zarf cümleciğinin (because/after/when/while/since + özne+fiil) KISALTILMIŞ hâlidir: bağlaç ve özne düşer, fiil -ing (aktif) ya da V3 (pasif) olur",
      "Uzun hâl: Because they realised their limitations, farmers turned to biological methods.",
      "Kısa (indirgenmiş) hâl: Realising their limitations, farmers turned to biological methods.",
      "-ing (aktif anlam, eşzamanlılık/sebep): Feeling tired, she went to bed.",
      "-ed / V3 (pasif anlam): Written in 1990, the book became a classic.",
      "Ana cümlenin öznesiyle ortaç cümleciğinin öznesi AYNI olmalıdır — bu kural sadece bağlaçsız (bare) ortaçlarda değil, bağlacın korunduğu indirgenmiş cümleciklerde de (although/though/while/when/since/once/before/after + V-ing ya da sıfat) geçerlidir",
      "Pratik çeviri kuralı: \"V-ing, cümle\" kalıbını görünce genelde -erek / -ince / -dığı için ile çevir",
    ],
    examples: [
      { en: "Having finished his homework, he went out to play.", tr: "Ödevini bitirdikten sonra oynamaya çıktı." },
      { en: "Knowing the answer, he smiled.", tr: "Cevabı bildiği için gülümsedi." },
      { en: "Seeing the accident, she called the police.", tr: "Kazayı görünce polisi aradı." },
      { en: "Although tired, she kept working.", tr: "Yorgun olmasına rağmen çalışmaya devam etti. (although + sıfat, özne aynı: she)" },
      { en: "While driving to work, I heard the news on the radio.", tr: "İşe giderken haberi radyoda duydum. (while + V-ing, özne aynı: I)" },
      { en: "Once completed, the building will house 500 employees.", tr: "Tamamlandığında bina 500 çalışanı barındıracak. (once + V3, pasif anlam, özne aynı: the building)" },
    ],
    pitfalls: [
      "Sarkan ortaç (dangling participle): ortacın öznesiyle ana cümlenin öznesinin uyuşmaması — gramatik olarak hatalı ama anlam \"makul\" göründüğü için sık seçilir",
      "❌ While driving to work, the radio broke. → ✅ While driving to work, I heard the radio break. (radyo araba kullanmıyor; \"driving\" özne ile \"the radio\" uyuşmuyor)",
      "❌ Although being tired, she went to work. → ✅ Although tired, she went to work. (although + sıfatta \"being\" genelde atılır)",
      "Bu \"özne aynı olmalı\" kuralını sadece although'a özgü sanmak — while, when, since, once, before, after gibi diğer bağlaçlarda da aynı kural geçerlidir",
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
      "the first / the last / the only + isim + to + V1 → \"...yapan ilk/son/tek...\" (superlative gibi davranan bu sıra/tekillik sıfatlarından sonra da to-infinitive gelir, aynı the + superlative + to + V1 kalıbı gibi)",
    ],
    examples: [
      { en: "The more you practice, the better you get.", tr: "Ne kadar çok pratik yaparsan o kadar iyi olursun." },
      { en: "She was the first person to arrive at the office.", tr: "Ofise gelen ilk kişi oydu." },
      { en: "He is the only student to have passed the exam.", tr: "Sınavı geçen tek öğrenci o." },
      { en: "It was the best film I have ever seen.", tr: "Şimdiye kadar izlediğim en iyi filmdi." },
    ],
    pitfalls: [
      "❌ more bigger / more better → ✅ bigger / better (çift comparative kullanmak)",
      "❌ bigger from him → ✅ bigger than him (than yerine from/that kullanmak)",
      "the + comparative...the + comparative kalıbında \"the\"yı atlamak",
      "as...as kalıbı arasına sıfatın yanlış hâlini (comparative/superlative) koymak",
      "❌ the first person who arrive / the first person arriving → ✅ the first person to arrive (the first/last/only + isimden sonra that/who + fiil yerine to + V1 kullanılmalı)",
      "the only + isim + to + V1 yapısını fark edip \"tek ... yapan\" anlamını cümlede es geçmek",
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
  {
    id: "perfect-infinitive",
    title: "Perfect Infinitive (to have + V3)",
    points: [
      "to have + V3, ana fiilin bildirdiği zamandan ÖNCE gerçekleşmiş bir eylemi anlatır — fiilsi yapıda 'geçmişe atıf'",
      "En sık seem, appear, claim, pretend, happen, tend gibi fiillerden sonra kullanılır: seem to have + V3, appear to have + V3, claim to have + V3",
      "Pasif haber/söylenti cümlelerinde sık görülür: is said/believed/thought/reported/known to have + V3 (geçmişte ... olduğu söyleniyor/sanılıyor)",
      "would like/love/hate to have + V3: yapılamamış bir geçmiş dileği/pişmanlığı anlatır (keşke yapabilseydim)",
      "Basit infinitive (to + V1) aynı anda ya da sonra gerçekleşen bir eylemi anlatırken, perfect infinitive (to have + V3) ondan ÖNCE tamamlanmış bir eylemi anlatır",
    ],
    examples: [
      { en: "He seems to have left the country.", tr: "Ülkeyi terk etmiş gibi görünüyor. (terk etme, 'görünüyor'dan önce gerçekleşti)" },
      { en: "The building is believed to have been built in the 16th century.", tr: "Binanın 16. yüzyılda inşa edildiğine inanılıyor." },
      { en: "She claims to have met the president.", tr: "Cumhurbaşkanıyla tanıştığını iddia ediyor." },
      { en: "I would like to have seen that movie last week.", tr: "Keşke geçen hafta o filmi görebilseydim. (yapılamamış geçmiş dilek)" },
    ],
    pitfalls: [
      "❌ He seems to leave yesterday. → ✅ He seems to have left yesterday. (geçmişe atıfta basit infinitive kullanmak)",
      "seem to have + V3 (geçmişte olmuş, şimdi öyle görünüyor) ile seem to + V1 (şu anki/genel durum) arasındaki zaman farkını gözden kaçırmak",
      "is said to have + V3 yapısını, aynı anlamı taşıyan 'It is said that + Past' cümlesine dönüştürememek — ikisi eşdeğerdir",
      "would like to have + V3 (geçmişte yapılamamış bir dilek) ile would like to + V1 (şimdi/gelecekteki bir istek) yapısını karıştırmak",
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
  {
    group: "Bağlaç Çevirileri — Zıtlık (Çeviri soruları için)",
    items: [
      { signal: "although / though / even though", structure: "-e rağmen, gerçi, her ne kadar ... olsa da" },
      { signal: "despite / in spite of", structure: "-e rağmen" },
      { signal: "whereas / while (karşılaştırma anlamında)", structure: "iken, oysa, -dığı hâlde" },
      { signal: "however", structure: "ancak, fakat, bununla birlikte" },
      { signal: "nevertheless / nonetheless", structure: "yine de, buna rağmen" },
      { signal: "on the other hand", structure: "öte yandan, diğer yandan" },
      { signal: "yet (cümle başında bağlaç olarak)", structure: "ama, yine de" },
      { signal: "even so", structure: "yine de, buna karşın" },
    ],
  },
  {
    group: "Bağlaç Çevirileri — Sebep / Sonuç (Çeviri soruları için)",
    items: [
      { signal: "because / since / as (sebep anlamında)", structure: "çünkü, -dığı için, -diğinden" },
      { signal: "because of / due to / owing to", structure: "-den dolayı, -den ötürü, sebebiyle" },
      { signal: "therefore / thus / hence", structure: "bu nedenle, dolayısıyla, bu yüzden" },
      { signal: "as a result / consequently", structure: "sonuç olarak, bunun sonucunda" },
      { signal: "so (cümle içinde sonuç bağlacı)", structure: "bu yüzden, bu nedenle" },
      { signal: "so + sıfat/zarf + that / such + isim + that", structure: "o kadar ... ki" },
      { signal: "given that", structure: "göz önüne alındığında, -dığına göre" },
    ],
  },
  {
    group: "Bağlaç Çevirileri — Amaç / Koşul (Çeviri soruları için)",
    items: [
      { signal: "so that / in order that", structure: "-mesi için, ki" },
      { signal: "in order to / so as to", structure: "-mek için, -mek amacıyla" },
      { signal: "if", structure: "eğer, -se/-sa" },
      { signal: "unless", structure: "-medikçe, -mezse, eğer ... değilse" },
      { signal: "provided that / providing that", structure: "şartıyla, koşuluyla" },
      { signal: "as long as", structure: "-dığı sürece" },
      { signal: "in case", structure: "-me ihtimaline karşı, olur da diye" },
      { signal: "even if", structure: "-se bile, olsa bile" },
    ],
  },
  {
    group: "Bağlaç Çevirileri — Zaman (Çeviri soruları için)",
    items: [
      { signal: "when", structure: "-diğinde, -ince" },
      { signal: "while", structure: "-irken, -dığı sırada" },
      { signal: "as (zaman anlamında)", structure: "-irken, -dıkça" },
      { signal: "before", structure: "-meden önce" },
      { signal: "after", structure: "-dikten sonra" },
      { signal: "since (zaman anlamında)", structure: "-den beri" },
      { signal: "until / till", structure: "-e kadar (bir eylem o ana kadar sürer)" },
      { signal: "by the time", structure: "-e kadar, -dığında (bir eylem o zamana kadar biter)" },
      { signal: "as soon as", structure: "-er -mez" },
      { signal: "once", structure: "-dığında, bir kere ... dikten sonra" },
    ],
  },
  {
    group: "Bağlaç Çevirileri — Ekleme / Örnekleme (Çeviri soruları için)",
    items: [
      { signal: "moreover / furthermore / in addition", structure: "ayrıca, bunun yanı sıra, dahası" },
      { signal: "besides", structure: "üstelik, ayrıca" },
      { signal: "not only ... but also", structure: "sadece ... değil aynı zamanda da" },
      { signal: "similarly / likewise", structure: "benzer şekilde" },
      { signal: "for example / for instance", structure: "örneğin" },
      { signal: "namely / that is (i.e.)", structure: "yani, daha doğrusu" },
      { signal: "in other words", structure: "başka bir deyişle" },
    ],
  },
];

// YÖKDİL/YDS'de anlamca yakın göründüğü için sık karıştırılan kelime çiftleri.
export const CONFUSED_PAIRS = [
  {
    id: "among-between",
    title: "among vs between",
    rule: "between iki kişi/şey arasında (ya da bir grup içindeki her biriyle tek tek ilişkiyi vurgularken); among üç veya daha fazla kişi/şeyden oluşan bir grubun İÇİNDE kullanılır.",
    examples: [
      { en: "Between you and me, I don't trust him.", tr: "Sadece aramızda kalsın, ona güvenmiyorum. (2 kişi)" },
      { en: "The prize was shared among the five winners.", tr: "Ödül beş kazanan arasında paylaştırıldı. (3+ kişi, grup içinde)" },
    ],
  },
  {
    id: "affect-effect",
    title: "affect vs effect",
    rule: "affect fiildir, \"etkilemek\" anlamına gelir. effect genelde isimdir, \"etki\" anlamına gelir (have an effect on).",
    examples: [
      { en: "The new policy will affect thousands of workers.", tr: "Yeni politika binlerce çalışanı etkileyecek." },
      { en: "The policy had a positive effect on productivity.", tr: "Politika verimlilik üzerinde olumlu bir etki yarattı." },
    ],
  },
  {
    id: "economic-economical",
    title: "economic vs economical",
    rule: "economic \"ekonomiyle ilgili\" demektir. economical \"tutumlu, idareli, az masraflı\" demektir.",
    examples: [
      { en: "The economic crisis affected millions of people.", tr: "Ekonomik kriz milyonlarca insanı etkiledi." },
      { en: "She bought an economical car that uses less fuel.", tr: "Daha az yakıt tüketen tutumlu bir araba aldı." },
    ],
  },
  {
    id: "historic-historical",
    title: "historic vs historical",
    rule: "historic \"tarihi önemi olan, önemli\" demektir. historical \"tarihle ilgili, geçmişe ait\" demektir (önemli olması gerekmez).",
    examples: [
      { en: "The signing of the treaty was a historic moment.", tr: "Antlaşmanın imzalanması tarihi bir andı." },
      { en: "The museum contains historical documents from the 1800s.", tr: "Müze 1800'lerden kalma tarihi belgeler içeriyor." },
    ],
  },
  {
    id: "principal-principle",
    title: "principal vs principle",
    rule: "principal sıfat olarak \"başlıca, temel\", isim olarak \"okul müdürü/anapara\" demektir. principle her zaman isimdir, \"ilke, prensip\" demektir.",
    examples: [
      { en: "The principal cause of the accident was speeding.", tr: "Kazanın başlıca nedeni hız yapmaktı." },
      { en: "The scientist explained the basic principles of physics.", tr: "Bilim insanı fiziğin temel ilkelerini açıkladı." },
    ],
  },
  {
    id: "later-latter",
    title: "later vs latter",
    rule: "later \"daha sonra\" demektir (zaman). latter \"ikisinden sonuncusu, sondan bahsedilen\" demektir (former ile karşılaştırılır).",
    examples: [
      { en: "We will discuss this later in the meeting.", tr: "Bunu toplantıda daha sonra konuşacağız." },
      { en: "Of the two options, the latter is more practical.", tr: "İki seçenekten ikincisi (sonuncusu) daha pratik." },
    ],
  },
  {
    id: "farther-further",
    title: "farther vs further",
    rule: "farther somut/fiziksel mesafe için kullanılır. further soyut anlamda \"daha fazla, ek\" demektir (further research, further information).",
    examples: [
      { en: "The village is ten miles farther than we thought.", tr: "Köy düşündüğümüzden on mil daha uzakta." },
      { en: "Further research is needed to confirm these results.", tr: "Bu sonuçları doğrulamak için ek araştırma gerekiyor." },
    ],
  },
  {
    id: "few-little",
    title: "few/a few vs little/a little",
    rule: "few ve a few sayılabilir çoğul isimlerle kullanılır; little ve a little sayılamayan isimlerle kullanılır. few/little \"neredeyse hiç yok\" (olumsuz); a few/a little \"birazcık var\" (olumlu) anlamı taşır.",
    examples: [
      { en: "Few people attended the lecture.", tr: "Derse neredeyse hiç kimse katılmadı." },
      { en: "A few students asked questions.", tr: "Birkaç öğrenci soru sordu." },
      { en: "There is little hope of finding survivors.", tr: "Hayatta kalanları bulma umudu neredeyse hiç yok." },
      { en: "We have a little time before the meeting.", tr: "Toplantıdan önce biraz zamanımız var." },
    ],
  },
  {
    id: "many-much",
    title: "many vs much",
    rule: "many sayılabilir çoğul isimlerle kullanılır (many experts). much sayılamayan isimlerle kullanılır (much time).",
    examples: [
      { en: "Many experts believe the trend will continue.", tr: "Birçok uzman eğilimin devam edeceğine inanıyor." },
      { en: "The project required much time and effort.", tr: "Proje çok zaman ve emek gerektirdi." },
    ],
  },
  {
    id: "other-another",
    title: "other vs another vs the other",
    rule: "another tekil, belirsiz bir şey daha demektir. other çoğul ya da belirli isimlerle kullanılır. the other belirlidir, ikiden kalan tek şeyi/kişiyi işaret eder.",
    examples: [
      { en: "Would you like another cup of coffee?", tr: "Bir kahve daha ister misin?" },
      { en: "Other studies have reached different conclusions.", tr: "Diğer çalışmalar farklı sonuçlara ulaştı." },
      { en: "One twin is quiet; the other is very outgoing.", tr: "İkizlerden biri sessiz; diğeri çok girişken." },
    ],
  },
  {
    id: "each-every",
    title: "each vs every",
    rule: "each bireyi tek tek vurgular, 2 veya daha fazla öge için kullanılabilir. every bir grubun bütününü vurgular, genelde 3+ öge için kullanılır.",
    examples: [
      { en: "Each student received individual feedback.", tr: "Her bir öğrenci ayrı ayrı geri bildirim aldı." },
      { en: "Every employee must complete the training.", tr: "Her çalışan eğitimi tamamlamalıdır." },
    ],
  },
  {
    id: "all-whole",
    title: "all vs whole",
    rule: "all çoğul veya sayılamayan isimlerle, the/my gibi belirteç olmadan da kullanılabilir. whole tekil isimle kullanılır ve genelde önünde the/a/my gibi bir belirteç bulunur.",
    examples: [
      { en: "All the students passed the exam.", tr: "Öğrencilerin tümü sınavı geçti." },
      { en: "She spent the whole day studying.", tr: "Bütün günü ders çalışarak geçirdi." },
    ],
  },
  {
    id: "beside-besides",
    title: "beside vs besides",
    rule: "beside \"yanında\" demektir (yer bildirir). besides \"üstelik, ayrıca, -e ek olarak\" demektir (bilgi ekler).",
    examples: [
      { en: "He sat beside her during the ceremony.", tr: "Tören boyunca onun yanında oturdu." },
      { en: "Besides being expensive, the plan is also impractical.", tr: "Pahalı olmasının yanı sıra, plan aynı zamanda pratik de değil." },
    ],
  },
  {
    id: "above-over",
    title: "above vs over",
    rule: "above dikey olarak yukarıda olmayı, temas olmadan, ya da sayısal olarak fazlalığı bildirir. over bir şeyin üzerinde/üzerinden geçerek, kapsayarak ya da aşarak anlamı taşır, temas olabilir.",
    examples: [
      { en: "The temperature rose above 40 degrees.", tr: "Sıcaklık 40 derecenin üzerine çıktı." },
      { en: "They built a bridge over the river.", tr: "Nehrin üzerine bir köprü inşa ettiler." },
    ],
  },
  {
    id: "during-while-for",
    title: "during vs while vs for",
    rule: "during + isim (bir olay/dönem boyunca). while + özne+fiil (bir eylem sürerken). for + süre ifadesi (ne kadar sürdüğünü bildirir).",
    examples: [
      { en: "She fell asleep during the lecture.", tr: "Ders sırasında uyuyakaldı." },
      { en: "While the manager was speaking, everyone listened carefully.", tr: "Yönetici konuşurken herkes dikkatle dinledi." },
      { en: "The project has been delayed for three months.", tr: "Proje üç aydır ertelenmiş durumda." },
    ],
  },
  {
    id: "until-by",
    title: "until vs by",
    rule: "until bir zamana KADAR devam eden bir eylemle kullanılır. by bir zamana kadar TAMAMLANMIŞ olması gereken bir eylemle kullanılır.",
    examples: [
      { en: "She will stay in London until Friday.", tr: "Cumaya kadar Londra'da kalacak. (cumaya kadar sürüyor)" },
      { en: "The report must be submitted by Friday.", tr: "Rapor cumaya kadar teslim edilmelidir. (cumaya kadar tamamlanmalı)" },
    ],
  },
  {
    id: "say-tell",
    title: "say vs tell",
    rule: "say kişi nesnesi almadan kullanılır (say that / say something). tell mutlaka bir kişi nesnesiyle kullanılır (tell someone that).",
    examples: [
      { en: "He said that he was busy.", tr: "Meşgul olduğunu söyledi." },
      { en: "He told me that he was busy.", tr: "Bana meşgul olduğunu söyledi." },
    ],
  },
  {
    id: "speak-talk",
    title: "speak vs talk",
    rule: "speak daha resmidir, genelde tek yönlü konuşma ya da dil bilme anlamında kullanılır. talk daha gündeliktir, karşılıklı sohbeti ifade eder.",
    examples: [
      { en: "She can speak three languages.", tr: "Üç dil konuşabiliyor." },
      { en: "They talked about their plans for the weekend.", tr: "Hafta sonu planları hakkında sohbet ettiler." },
    ],
  },
  {
    id: "borrow-lend",
    title: "borrow vs lend",
    rule: "borrow \"ödünç almak\" demektir (borrow FROM someone). lend \"ödünç vermek\" demektir (lend TO someone / lend someone something).",
    examples: [
      { en: "Can I borrow your pen?", tr: "Kalemini ödünç alabilir miyim?" },
      { en: "She lent him some money.", tr: "Ona biraz para ödünç verdi." },
    ],
  },
  {
    id: "remember-remind",
    title: "remember vs remind",
    rule: "remember kişinin kendiliğinden hatırlamasıdır. remind birinin başka birine bir şeyi hatırlatmasıdır (remind someone to do something / of something).",
    examples: [
      { en: "I remember meeting him at the conference.", tr: "Onunla konferansta tanıştığımı hatırlıyorum." },
      { en: "Please remind me to call the client tomorrow.", tr: "Lütfen yarın müşteriyi aramam gerektiğini bana hatırlat." },
    ],
  },
  {
    id: "actually-currently-eventually",
    title: "actually vs currently vs eventually",
    rule: "actually \"aslında, gerçekte\" demektir (beklenenin aksini vurgular). currently \"şu anda, hâlihazırda\" demektir. eventually \"sonunda, en nihayetinde\" demektir (uzun bir süreçten sonra).",
    examples: [
      { en: "Actually, the results were quite different from what we expected.", tr: "Aslında sonuçlar beklediğimizden oldukça farklıydı." },
      { en: "The company is currently developing a new product.", tr: "Şirket şu anda yeni bir ürün geliştiriyor." },
      { en: "After months of delay, the project eventually succeeded.", tr: "Aylarca süren gecikmenin ardından proje sonunda başarılı oldu." },
    ],
  },
  {
    id: "likely-probably",
    title: "likely vs probably",
    rule: "probably bir zarftır, cümlede be fiilinden sonra ya da ana fiilden önce yer alır. likely genelde \"be likely to V\" ya da \"it is likely that\" kalıbıyla kullanılır, tek başına zarf gibi cümle ortasına konmaz.",
    examples: [
      { en: "The meeting will probably be postponed.", tr: "Toplantı muhtemelen ertelenecek." },
      { en: "The meeting is likely to be postponed.", tr: "Toplantının ertelenmesi muhtemel." },
    ],
  },
  {
    id: "as-as-vs-so-that",
    title: "as...as vs so...as vs so...that",
    rule: "as...as iki şeyin EŞİT olduğunu belirtir, hem olumlu hem olumsuz cümlede kullanılır. so...as SADECE olumsuz cümlelerde as...as'in yerine geçebilir (not so...as = not as...as); olumlu cümlede \"so tall as\" denmez. so...that ise eşitlikle ilgisi olmayan bambaşka bir yapıdır — SONUÇ bildirir (o kadar ... ki).",
    examples: [
      { en: "She is as tall as her brother.", tr: "O, kardeşi kadar uzun. (olumlu eşitlik, sadece as...as)" },
      { en: "She is not as tall as her brother. / She is not so tall as her brother.", tr: "O, kardeşi kadar uzun değil. (olumsuzda ikisi de kullanılabilir)" },
      { en: "He was so tired that he fell asleep immediately.", tr: "O kadar yorgundu ki hemen uyuyakaldı. (sonuç cümleciği, eşitlikle alakasız)" },
    ],
  },
  {
    id: "because-vs-so",
    title: "because vs so",
    rule: "because SEBEP bildirir — sonrasında gelen cümle nedendir (çünkü). so SONUÇ bildirir — sonrasında gelen cümle nedenin doğurduğu sonuçtur (bu yüzden/dolayısıyla). İkisi de aynı iki fikri bağlar ama sırayı tersine çevirir; birbirinin yerine kullanılamaz. because cümle başında da olabilir (Because..., ana cümle...), so ise her zaman iki cümle arasında, sonuç cümlesinin başında yer alır — cümle başında tek başına duramaz.",
    examples: [
      { en: "We stayed home because it was raining.", tr: "Yağmur yağdığı için evde kaldık. (because + sebep)" },
      { en: "It was raining, so we stayed home.", tr: "Yağmur yağıyordu, bu yüzden evde kaldık. (so + sonuç, aynı olay ama sıra ters)" },
      { en: "Because it was raining, we stayed home.", tr: "Yağmur yağdığı için evde kaldık. (because cümle başında da olabilir)" },
    ],
  },
];
