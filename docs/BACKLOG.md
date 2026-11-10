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

- [ ] **Tarihler Şubat 2027'ye sabit.** 45 günden uzak bir taşınma tarihi
      seçilince deste boşalıyor; o tarihten sonra demo eskir. Tarihleri bugüne
      göre üretmek testleri ve veritabanı demo verisini de değiştirir; bu
      yüzden bilerek ertelendi. Hazır mesajlarda "Hey Alex!" ve "Yesterday" de
      sabit.
- [ ] **İndirilen dil paketleri arayüzün ancak yarısını çevirebilir.**
      Metinlerin yaklaşık yarısı yalnızca `tr.json`'da anahtar olarak duruyor;
      `/api/translations` ve doğrulayıcı yalnızca `en.json` anahtarlarını
      tanıyor. Türkçe etkilenmiyor.
- [ ] **Çoğul ekleri:** "1 ay", "1 kişi", "1 şey" ve "1 gün" düzeltildi; eşleşme
      gerekçelerindeki "you selected 1 months" gibi nadir kalıplar duruyor.

## 3. Temizlik

- [ ] **`ProfileDialog`'daki "Team up / Waiting" dalı ulaşılamaz.**
- [ ] **`en.json`'daki 386 anahtarın yaklaşık 265'i kullanılmıyor.**
- [ ] **ESLint uyarıları:** iki React kanca kuralı uyarı düzeyinde (13 yer).
      İncelemede hiçbiri gerçek hata çıkmadı; yine de tek tek düzeltilebilir.
- [ ] **`onboarded` ve `Conversation.matchedAt` yazılıyor ama okunmuyor;**
      veritabanı bağlanınca ikisi de kullanılacak.

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
