# RoomPair — ele alınacaklar

Henüz yapılmamış işler. Bir madde tamamlandığında listeden silin. Canlı site
hesaplarla çalışır (Supabase); ortam değişkenleri yoksa uygulama tarayıcıda
duran demo olarak açılır.

## 1. Sizin yapmanız gerekenler

- [ ] **Sızdırılmış şifre koruması** kapalı. Supabase panelinde
      Authentication → Sign In / Providers → Email altından açılır (ücretli
      plan isteyebilir).
- [ ] **Sunumda iki gerçek hesap gerekir:** demo üyeler cevap vermez.
- [ ] **Gizlilik bildirimi hukukçu metni değildir.** `/privacy` sayfası
      uygulamanın gerçekte ne sakladığını anlatır; KVKK/GDPR için veri
      sorumlusu ve iletişim adresi eklenmelidir.

## 2. Bilinen eksikler

- [ ] **Tarihler Şubat 2027'ye sabit.** 45 günden uzak bir taşınma tarihi
      seçilince deste boşalıyor; o tarihten sonra demo eskir. Tarihleri bugüne
      göre üretmek testleri ve veritabanı demo verisini de değiştirir; bu
      yüzden bilerek ertelendi. Hazır mesajlarda "Hey Alex!" ve "Yesterday" de
      sabit.
- [ ] **Öğrenci doğrulaması bağlı değil;** hesap modunda düğme yalnızca bunu
      söylüyor.
- [ ] **Yeni beğeniler anlık değil,** 15 saniyede bir yoklanıyor (mesajlar ve
      eşleşmeler anlık). Bilerek: silinen bir beğeni kimin kimi beğendiğini
      herkese duyururdu.
- [ ] **Moderasyon kuyruğu yok:** şikâyetler veritabanına yazılıyor ama
      inceleyecek bir ekran yok.
- [ ] **Çoğul ekleri:** eşleşme gerekçelerindeki "you selected 1 months" gibi
      nadir kalıplar duruyor.

## 3. Temizlik

- [ ] **`ProfileDialog`'daki "Team up / Waiting" dalı ulaşılamaz.**
- [ ] **ESLint uyarıları:** iki React kanca kuralı uyarı düzeyinde (15 yer).
      İncelemede hiçbiri gerçek hata çıkmadı.
- [ ] **`Conversation.matchedAt` yazılıyor ama okunmuyor.**

## 4. Güvenlik (küçük, bilerek bırakıldı)

- [ ] **CSP'de `'unsafe-inline'`:** sayfa statik üretildiği için gerekli;
      dinamik sayfalarda nonce'a geçilebilir.
- [ ] **`/design-system` ve `/swipe-variants`** production'da herkese açık
      (ekip canlı sayfayı kullanıyor; gizli veri içermez).
- [ ] **`/api/translations` için hız sınırı yok;** 32+ karakterlik anahtar
      olmadan hiçbir şey yapmaz.
- [ ] **`--hostname 0.0.0.0`:** geliştirme sunucusunu aynı ağdaki herkese
      açıyor; telefonda demo için gerekmiyorsa kaldırın.
