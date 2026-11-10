# RoomPair — ele alınacaklar

Yeni tasarımın kod incelemesinden kalan, henüz yapılmamış işler. Bir madde
tamamlandığında listeden silin. Uygulama şu an hesapsız bir demodur; veriler
tarayıcıda durur.

## 1. Hesaplar ve veritabanı

**Yapıldı:** giriş/kayıt, profil ve oda ilanı, fotoğraf yükleme, beğeni,
eşleşme, gerçek mesajlaşma, engelleme ve şikâyet veritabanına bağlı (bkz.
`docs/database.md`). Ortam değişkenleri yoksa uygulama eskisi gibi tarayıcı
demosu olarak çalışır. Canlı sitede **henüz açık değil**.

Canlıya almak için kalanlar:

- [ ] **Vercel ortam değişkenleri:** `NEXT_PUBLIC_SUPABASE_URL` ve
      `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Eklenip yeniden yayınlanınca canlı
      site giriş ister ve hazır demo sohbetleri kaybolur.
- [ ] **Supabase Auth ayarları:** e-posta onayı açıkken kayıt olan kişi önce
      e-postasındaki bağlantıya tıklamak zorunda ve ücretsiz planda saatte
      birkaç e-posta gönderilebiliyor. Demo için onayı kapatın; sızdırılmış
      şifre korumasını açın.
- [ ] **Gerçek projede uçtan uca deneme.** Hesap testleri yerel Supabase'de
      geçiyor; gerçek projede henüz denenmedi.
- [ ] **Yeni mesajlar 6 saniyede bir yoklanarak geliyor.** Anlık olması için
      Supabase Realtime'a geçilebilir.
- [ ] **Öğrenci doğrulaması bağlı değil;** hesap modunda düğme yalnızca bunu
      söylüyor.
- [ ] **Yeni üyenin yaşı sorulmuyor** (varsayılan 22 görünüyor); profil
      düzenlemede değiştirilebiliyor ama kurulumda adım yok.
- [ ] **Silinen fotoğrafların dosyası depoda kalıyor.**
- [ ] **Demo hesapları cevap vermez;** sunumda iki gerçek hesap gerekir.
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
