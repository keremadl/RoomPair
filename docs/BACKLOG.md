# RoomPair — ele alınacaklar

Henüz yapılmamış işler ve bilinçli mimari tercihler. Canlı site hesaplarla
çalışır (Supabase); ortam değişkenleri yoksa uygulama tarayıcıda duran kendi
kendine yeten demo olarak açılır.

## 1. Sunum ve canlı ortam hazırlığı

- [ ] **Sızdırılmış şifre koruması** kapalı. Supabase'de yalnızca Pro planda
      açılabiliyor; ücretsiz planda kaldığımız sürece sonraya bırakıldı.
- [ ] **Sunumda iki gerçek hesap gerekir:** hesap modunda demo üyeler mesajlara
      otomatik cevap vermez (tarayıcı demosunda simüle cevaplar açıktır).
- [ ] **Gizlilik bildirimi hukukçu metni değildir.** `/privacy` sayfası
      uygulamanın gerçekte ne sakladığını açıkça anlatır; gerçek yayına çıkarken
      KVKK/GDPR kapsamında veri sorumlusu ve iletişim adresi eklenmelidir.

## 2. Bilinen sınırlar ve bilinçli tercihler

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

## 3. Güvenlik ve ortam notları (küçük, bilerek bırakıldı)

- [ ] **CSP'de `'unsafe-inline'`:** sayfa statik üretildiği için gerekli;
      dinamik sayfalarda nonce'a geçilebilir.
- [ ] **`/design-system` ve `/swipe-variants`** production'da herkese açık
      (ekip ve jüri canlı sayfayı incelemek için kullanıyor; gizli veri içermez).
- [ ] **`/api/translations` için hız sınırı yok;** 32+ karakterlik yönetici
      anahtarı olmadan hiçbir şey yapmaz (varsayılan olarak kapalıdır, `503`).
- [ ] **`--hostname 0.0.0.0`:** geliştirme sunucusunu aynı ağdaki telefonlardan
      test edebilmek için açık bırakıldı.
