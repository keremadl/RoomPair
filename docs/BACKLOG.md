# RoomPair — ele alınacaklar

Kod incelemesinden çıkan ve henüz yapılmamış işlerin listesi. Uygulama şu an
bilinçli olarak sunucusuz bir demodur; kullanıcı hesapları ve gerçek veritabanı
en son aşamada eklenecek. Bir madde tamamlandığında listeden silin.

## 1. Son aşama: hesaplar ve gerçek veritabanı

Bunlar birbirine bağlı; tek bir geçiş olarak planlanmalı.

- [ ] **Kimlik doğrulama ve oturum.** Kayıt, giriş, çıkış, oturum süresi. Şu an
      hiçbiri yok; herkes aynı "Alex" demo kullanıcısıdır.
- [ ] **Sunucu tarafı kalıcılık.** Profiller, beğeniler, eşleşmeler, mesajlar,
      kayıtlı odalar ve notlar `localStorage` yerine veritabanında tutulmalı.
      `src/lib/store.ts` içindeki `AppState` bu geçişin başlangıç şemasıdır.
- [ ] **Yetkilendirme.** Her kayıt için "bunu kim okuyabilir/değiştirebilir"
      kuralı (ör. yalnızca eşleşen iki kişi sohbeti görebilir). Kurallar
      veritabanı katmanında da uygulanmalı, yalnızca arayüzde değil.
- [ ] **Sunucuda girdi doğrulama.** Onboarding ve filtre formundaki kurallar
      (bütçe 100–5000, kalış 1–24 ay, geçmiş tarih yok) sunucuda tekrarlanmalı.
      Eşleştirme (`src/lib/matching.ts`) saf fonksiyondur; sunucuya taşınabilir.
- [ ] **Gerçek mesajlaşma.** Simüle yanıtlar (`reply.*` anahtarları) kaldırılıp
      gerçek zamanlı ya da en azından sunucudan okunan mesajlar gelmeli.
- [ ] **Şikâyet ve engelleme.** Şikâyetler `state.reports` içine yazılıyor ama
      hiçbir yerde okunmuyor. Bir moderasyon kuyruğuna ulaşmalı; engeli kaldırma
      arayüzü eklenmeli (şu an tek yol demoyu sıfırlamak).
- [ ] **Öğrenci/kimlik doğrulaması.** `verified` alanı sabit demo verisidir.
- [ ] **Ev sahibinin kendi odasını girmesi.** "Odam var" seçeneği oda bilgisi
      (fiyat, fotoğraf, açıklama) toplamıyor. Veri modeli veritabanıyla birlikte
      tasarlanmalı; `Room` tipi ve `profile.room` buna temel olabilir.
- [ ] **Gizlilik.** Gizlilik metni, KVKK/GDPR açık rızası, veri silme talebi,
      yaş sınırı. Mesaj ve notlar kişisel veridir.
- [ ] **Mesaj içeriği moderasyonu** ve kötüye kullanım için hız sınırları.
- [ ] **`Conversation.matchedAt`** saklanıyor ama gösterilmiyor; gerçek
      tarihlerle birlikte sohbet başlığında kullanılabilir.

## 2. Güvenlik (hesaplardan bağımsız, küçük işler)

- [ ] **`/api/translations` için hız sınırı.** Token en az 32 karakter olduğu
      için kaba kuvvet pratik değil, yine de başarısız denemeler sınırlanmalı.
      Canlıya çıkarken bu uç ya kaldırılmalı ya da özel ağda tutulmalı.
- [ ] **`--hostname 0.0.0.0`.** `dev` ve `start` komutları sunucuyu aynı ağdaki
      herkese açıyor. Telefonda demo göstermek için gerekli değilse kaldırın.
- [ ] **CSP'de `'unsafe-inline'`.** Sayfa statik üretildiği için Next.js bunu
      gerektiriyor. Sayfalar dinamik hale geldiğinde nonce tabanlı CSP'ye
      geçilebilir (`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`).
- [ ] **HSTS başlığı.** HTTPS ile yayınlanınca `Strict-Transport-Security`
      eklenmeli (yerel HTTP demosunu bozacağı için şimdi eklenmedi).

## 3. Mühendislik

- [ ] **`next/image` ve `next/font`.** Görseller ham `<img>`, fontlar `.ttf`.
      Görsel düzeni etkileyebileceği için gözle kontrol edilerek yapılmalı.
      ESLint'teki `@next/next/no-img-element` kuralı bu yüzden kapalı.
- [ ] **Sunucu tarafı render.** Uygulamanın tamamı istemci bileşeni; sunucu
      yalnızca yükleme ekranını üretiyor. Veritabanı geldiğinde sayfalar sunucu
      bileşenlerine taşınabilir.
- [ ] **`app/controller.tsx` tek bir bağlam.** Tüm arayüz durumu tek kancada;
      herhangi bir değişiklik tüm sayfaları yeniden çiziyor. Demo ölçeğinde sorun
      değil; büyürse keşif, sohbet ve alan için ayrı bağlamlara bölünmeli.
- [ ] **Bileşen testleri yok.** Arayüz yalnızca uçtan uca testlerle sınanıyor.
- [ ] **Test edilmeyen parçalar:** çeviri CLI'si (`scripts/generate-locale.mjs`),
      n8n iş akışı, ek dil dosyalarının yüklenmesi ve başarısız indirme.
- [ ] **`scripts/capture-preview.cjs`** hâlâ sistemde kurulu Chrome'u varsayıyor
      ve seçicileri İngilizce arayüze bağlı.
- [ ] **`docs/*.png` önizlemeleri** arayüz değişikliklerinden önce alındı;
      sunumdan önce yeniden üretilmeli.

## 4. Davranış ve veri

- [ ] **Sabit tarihler.** Demo verisi ve varsayılan taşınma tarihi Şubat
      2027'ye sabit. O tarihten sonra varsayılan tercih "geçmiş tarih" sayılır
      ve akış boşalır. Tarihler bugüne göre üretilmeli.
- [ ] **Pasif ve başka şehirden profil yok.** Bu eleme kuralları birim
      testlerinde yapay profillerle sınanıyor ama demoda gösterilemiyor.
      Eklemek için yeni (lisansı uygun) fotoğraf gerekir.
- [ ] **Demo sohbetleri ve profil metinleri İngilizce.** Kullanıcı içeriği
      sayıldığı için çevrilmiyor; Türkçe sunumda karışık görünür. Seed verisi
      için Türkçe sürüm eklenebilir.
- [ ] **Seed mesajlarındaki saatler** ("10:24", "Yesterday") sabit metin.
- [ ] **Geri al, mesajlaşılmış bir eşleşmede** kararı siliyor ama sohbeti
      bırakıyor; kişi keşif akışına geri dönüyor.
- [ ] **Sağdan sola diller.** Yükleyici `dir="rtl"` ayarlıyor ama CSS fiziksel
      sol/sağ değerleri kullanıyor; düzen gözden geçirilmedi.
