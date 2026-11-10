# RoomPair — ele alınacaklar

Henüz yapılmamış işler. Bir madde tamamlandığında listeden silin. Canlı site
hesaplarla çalışır (Supabase); ortam değişkenleri yoksa uygulama tarayıcıda
duran demo olarak açılır.

## 1. Sizin yapmanız gerekenler

- [ ] **Sızdırılmış şifre koruması** kapalı. Supabase'de yalnızca Pro planda
      açılabiliyor; ücretsiz planda kaldığımız sürece sonraya bırakıldı.
- [ ] **Sunumda iki gerçek hesap gerekir:** demo üyeler cevap vermez.
- [ ] **Gizlilik bildirimi hukukçu metni değildir.** `/privacy` sayfası
      uygulamanın gerçekte ne sakladığını anlatır; KVKK/GDPR için veri
      sorumlusu ve iletişim adresi eklenmelidir.

## 2. Bilinen eksikler

- [ ] **Veritabanındaki demo tarihleri tohum çalıştığı güne göre yazılır.**
      Tarayıcı demosunda tarihler her gün bugüne göre hesaplanır; veritabanında
      ise `supabase/seed.sql` yeniden çalıştırılınca yenilenir. Sunumdan önce
      bir kez çalıştırmak yeterli.
- [ ] **Öğrenci doğrulaması bağlı değil;** hesap modunda düğme yalnızca bunu
      söylüyor. Gerçek doğrulama, e-posta onayı açıkken okul e-postasına
      bağlantı göndermeyi gerektirir; onay kapalıyken yapılırsa herkes sahte
      bir okul adresi yazıp "doğrulanmış" görünür.
- [ ] **Yeni beğeniler anlık değil,** 15 saniyede bir yoklanıyor (mesajlar ve
      eşleşmeler anlık). Bilerek: silinen bir beğeni kimin kimi beğendiğini
      herkese duyururdu.
- [ ] **Moderatör eklemek elle yapılır:** Supabase SQL editöründe
      `private.moderators` tablosuna satır eklenir (bkz. `docs/database.md`).
      Gizlenen üyeyi geri açmak da şimdilik SQL ile.

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
