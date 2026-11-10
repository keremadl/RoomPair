# RoomPair — ele alınacaklar

Yeni tasarımın kod incelemesinden kalan, henüz yapılmamış işler. Bir madde
tamamlandığında listeden silin. Uygulama şu an hesapsız bir demodur; veriler
tarayıcıda durur.

## 1. Hesaplar ve veritabanı (en büyük kalan iş)

Veritabanı tarafı hazır ve gerçek Supabase projesinde kurulu (bkz.
`docs/database.md`). Kalan iş arayüzü ona bağlamak.

- [ ] **Giriş/kayıt ekranı**, yeni tasarım diliyle (`src/design-system`).
- [ ] **Veri eşitleme:** profil, beğeni, eşleşme, mesaj, engel ve şikâyetlerin
      `localStorage` yerine veritabanından okunup yazılması. Eski tasarım için
      yazılmış bir sürümü git geçmişinde duruyor (commit `edba29d`,
      `src/lib/backend/`); mantığı aynı, veri yapısı yeni tasarıma uyarlanmalı.
- [ ] **Fotoğraf yükleme:** fotoğraflar şu an tarayıcıda veri olarak tutuluyor
      ve depolama kotasını hızla dolduruyor. Supabase'deki özel klasörlere
      (`profile-photos`, `chat-photos`) yüklenmeli.
- [ ] **Gerçek mesajlaşma;** simüle yanıtlar kalkacak. Demo hesapları cevap
      vermez; sunumda iki hesap gerekir.
- [ ] **Supabase Auth ayarları:** sızdırılmış şifre koruması kapalı; demo için
      e-posta onayı kapatılmalı.
- [ ] **Vercel ortam değişkenleri** (`NEXT_PUBLIC_SUPABASE_URL` ve yayınlanabilir
      anahtar). Eklendiğinde canlı site giriş ister.
- [ ] **Gizlilik metni, KVKK/GDPR rızası, yaş sınırı, moderasyon kuyruğu.**

## 2. Doğrulanmış ama düzeltilmemiş bulgular

- [ ] **Profil eksikken "Skip" hâlâ çalışıyor mu?** Ok tuşları kapatıldı;
      düğmeyle geçiş ayrıca kontrol edilmeli.
- [ ] **Filtreler ve kurulum farklı kurallar uyguluyor.** Kurulum bütçeyi
      100–5000 ile sınırlıyor, Filtreler 0'dan sınırsıza kabul ediyor. İkisi de
      geçmiş tarihi reddetmiyor.
- [ ] **Tarihler Şubat 2027'ye sabit.** 45 günden uzak bir taşınma tarihi
      seçilince deste boşalıyor; o tarihten sonra demo eskir. Tarihler bugüne
      göre üretilmeli. Hazır mesajlarda "Hey Alex!" ve "Yesterday" de sabit.
- [ ] **Çoğul ekleri:** "1 months", "1 people", "1 days" gibi çıktılar var.
- [ ] **İndirilen dil paketleri arayüzün ancak yarısını çevirebilir.**
      Metinlerin yaklaşık yarısı yalnızca `tr.json`'da anahtar olarak duruyor;
      `/api/translations` ve doğrulayıcı yalnızca `en.json` anahtarlarını
      tanıyor. Türkçe etkilenmiyor.
- [ ] **Fotoğraf seçimi:** dosya boyutu sınırı yok; çoklu seçimde tek bozuk
      dosya hepsini reddediyor; iki seçim üst üste gelirse ilki kayboluyor.
- [ ] **Bazı demo profillerde düzenleyicinin sunmadığı diller var** (Lehçe,
      Litvanca, Japonca, Hintçe).

## 3. Temizlik

- [ ] **Kullanılmayan kod:** `PersonCard` bileşeni hiç çizilmiyor;
      `ProfileDialog`'daki "Team up / Waiting" dalı ulaşılamaz;
      `src/lib/discover/deck.ts`'te dört kullanılmayan dışa aktarım.
- [ ] **`en.json`'daki 386 anahtarın yaklaşık 265'i kullanılmıyor.**
- [ ] **ESLint uyarıları:** iki React kanca kuralı uyarı düzeyinde (13 yer).
      İncelemede hiçbiri gerçek hata çıkmadı; yine de tek tek düzeltilebilir.
- [ ] **`onboarded` ve `Conversation.matchedAt` yazılıyor ama okunmuyor.**

## 4. Güvenlik (küçük)

- [ ] **CSP'de `'unsafe-inline'`:** sayfa statik üretildiği için gerekli;
      dinamik sayfalarda nonce'a geçilebilir.
- [ ] **`/design-system` ve `/swipe-variants`** production'da herkese açık.
- [ ] **`/api/translations` için hız sınırı yok** (32+ karakterlik anahtar
      riski düşürüyor).
- [ ] **`--hostname 0.0.0.0`:** sunucuyu aynı ağdaki herkese açıyor; telefonda
      demo için gerekmiyorsa kaldırın.
- [ ] **Uzunluk sınırları yalnızca istemcide;** veritabanı bağlanınca oradaki
      kısıtlar devreye girer.
