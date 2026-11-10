# Kurulum ekranı çizimleri — yapılacak iş

> **Durum: yapıldı.** 25 çizimin hepsi Codex CLI'ın görsel üreticisiyle,
> aşağıdaki ortak istem ve "Subject" satırlarıyla üretildi. Kaynakları
> `source/<kimlik>.webp` (720 × 480, saydam zemin, kayıpsız).
>
> **Çizimler seçili renk paletini izler.** Kaynaklar klasik paletle (mor,
> turuncu, lacivert çizgi) çizildi; uygulama onları olduğu gibi göstermez.
> `python3 scripts/illustrations/split.py` her çizimi dört katmana ayırır ve
> `public/images/onboarding/` altına yazar: kendi rengini koruyan `base` ile
> yalnızca saydamlık taşıyan `ink`, `primary`, `accent`. Kurulum ekranı bu üç
> katmanı `--art-ink`, `--art-primary` ve `--art-accent` renkleriyle boyar
> (`theme.css` ve palet dosyaları). Böylece 8 paletin ve koyu temanın hepsinde
> çizim arayüzle aynı renklerde durur ve yeniden üretmek gerekmez.
>
> Yeni bir soru eklenirse: aynı istemle bir çizim üretin, `source/` altına
> koyun ve betiği çalıştırın. Dosyası olmayan soru ikonlu çıkartmaya döner.
> Bu dosyanın geri kalanı o işin brifidir.
>
> Brife göre farklar: ortak istemden "sert kaymış gölge" çıkarıldı (arayüz
> yumuşak 3D'ye geçti); dosyalar PNG yerine WebP; çizim başına dört katman.

Kurulumda her sorunun üstünde şu an ikonlu bir "çıkartma" karosu var
(`src/components/app/Onboarding.tsx`, `.sticker`). Bunun yerine her soruya özel
bir çizim koymak istiyoruz. Bu dosya o iş için brif: ne çizilecek, hangi tarzda,
dosyalar nereye konacak ve koda nasıl bağlanacak.

Çizimler bir görsel üretici ile yapılacak (Codex CLI üzerinden). Aşağıdaki
İngilizce istemler doğrudan kullanılabilir.

## Referans

`reference/ref-01.jpg` … `ref-17.jpg`: Badoo'nun kurulum ekranlarından alınmış
ekran görüntüleri. **Yalnızca fikir vermek için buradalar:** soru başına bir
sahne, sahnenin ekranın üst kısmını kaplaması, az sayıda renk, büyük ve net
nesneler. Çizimlerin kendisi, renkleri, karakterleri veya kompozisyonu
kopyalanmamalı (bkz. `AGENTS.md`: başka bir ürünün görsel tasarımı yeniden
üretilmez). Telefon numarası veya kişisel fotoğraf içeren ekran görüntüleri
bu klasöre bilerek alınmadı.

Referanstan alınacak olanlar:

- Her soruda tek, hemen anlaşılan bir sahne (içki → kadeh, evcil hayvan → kedi
  ve köpek).
- Sahne metnin üstünde, ekranın yaklaşık üçte birini kaplıyor.
- Sahneler tek tek farklı ama aynı elden çıkmış gibi: aynı çizgi, aynı renkler.

Alınmayacak olanlar: Badoo'nun mor–kırmızı paleti, grenli gölgeleri, el ve
insan figürleri, tek tek sahnelerin kendisi.

## Bizim tarzımız

Tasarım dili "F · Card": herkes bir oyun karakter kartı
(`src/design-system/languages/card/README.md`). Çizimler buna uymalı:

- **Çizgi:** kalın, koyu lacivert dış çizgi (`#1d2240`), her yerde aynı
  kalınlık, yuvarlatılmış uçlar ve köşeler.
- **Dolgu:** düz renk, gradyan yok, gren yok.
- **Gölge:** yumuşak gölge yok; nesnenin altında aynı lacivertle sert, kaymış
  bir "basılı" gölge (düğmelerimizdeki gibi).
- **Renkler (klasik palet):** mor `#5b3fd6`, turuncu-sarı `#f5a524`, lacivert
  `#1d2240`, krem `#fffdf8`, açık gri-mavi zemin `#e7ebf3`; vurgu için yeşil
  `#17784d` ve mavi `#2d62c9`. Sahne başına en fazla dört renk.
- **Konu:** nesneler ve mekânlar. İnsan figürü, yüz ve el yok (kartlardaki
  gerçek fotoğraflarla yarışmasın, her üyeyi temsil edebilsin).
- **Hava:** oyuncu ve sıcak; nesneler hafif eğik durabilir, birkaç küçük
  yıldız veya parıltı olabilir.
- **Yazı yok:** çizimin içinde harf, rakam, logo olmamalı (arayüz Türkçe ve
  İngilizce).

## Teknik gereksinimler

- Biçim: saydam zeminli **PNG**, 1200 × 800 piksel (3:2). Arayüzde yaklaşık
  360 × 240 gösterilecek.
- Zemin saydam olmalı; çizim hem açık (`#e7ebf3`) hem koyu (`#12142b`
  dolaylarında) zeminde okunmalı. Bu yüzden dış çizgi her nesnenin etrafını
  kapatmalı ve krem dolgu kullanılmalı; saf beyaz veya saf siyah zemine
  güvenilmemeli.
- Uygulamada 8 renk paleti var. Çizimler klasik paletle üretilecek; diğer
  paletlerde aynı görsel kullanılacak (mor ve turuncu çoğu paletle uyumlu).
- Dosya yolu: `public/images/onboarding/<kimlik>.png` (kimlikler aşağıda).
- Dosya başına hedef boyut: 150 KB altı.

## Ortak istem (her çizimin başına)

```
Flat vector sticker illustration for a mobile app onboarding screen.
Thick uniform dark navy outline (#1d2240) with rounded caps and corners,
flat solid fills, no gradients, no grain, no soft shadows; a hard offset
navy drop shadow under the main object, like a pressed game button.
Palette limited to violet #5b3fd6, amber #f5a524, navy #1d2240, cream
#fffdf8, with small accents of green #17784d or blue #2d62c9.
Playful, warm, slightly tilted objects, a few small sparkles.
Objects and places only: no people, no faces, no hands. No text, no letters,
no numbers, no logos. Transparent background, centered composition, 3:2.
Subject:
```

## Çizim listesi

Kimlikler koddaki soru kimlikleriyle aynıdır (`SetupQuestion`).

| Kimlik        | Soru (EN)                          | Sahne fikri                                | "Subject:" satırı                                                                    |
| ------------- | ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `name`        | What is your name and age?         | İsim etiketi ve doğum günü pastası         | a blank name tag sticker next to a small birthday cake with one candle               |
| `intent`      | What brings you here?              | Anahtar ve kapı                            | a big key leaning against a slightly open front door                                 |
| `gender`      | Which describes you?               | Üç farklı oyun piyonu                      | three different board game pawns standing side by side                               |
| `city`        | Where do you want to live?         | Harita üstünde konum iğnesi                | a folded city map with a large location pin stuck in it                              |
| `budget`      | What is your monthly budget?       | Cüzdan ve madeni paralar                   | an open wallet with a few coins and a banknote sticking out                          |
| `room`        | Tell us about the room             | Fiyat etiketi asılı oda kapısı             | a room door with a blank price tag hanging from the handle                           |
| `roomPhotos`  | Show the room                      | Fotoğraf makinesi ve oda fotoğrafı         | a camera next to a polaroid photo showing a bed and a window                         |
| `moveDate`    | When, and for how long?            | Takvim ve taşınma kolisi                   | a wall calendar with one day circled and a cardboard moving box beside it            |
| `photos`      | Add a photo of yourself            | Boş portre çerçevesi ve fotoğraf makinesi  | an empty portrait picture frame with a small camera and a flash sparkle              |
| `work`        | What do you do?                    | Sırt çantası, kitaplar, dizüstü bilgisayar | a backpack, a stack of books and an open laptop                                      |
| `smoke`       | Do you smoke?                      | Açık pencere ve küllük                     | an open window with a curtain moving in the breeze and an ashtray on the sill        |
| `pets`        | Do you have a pet?                 | Kedi ve köpek yan yana                     | a cat sitting on top of a friendly dog, with a food bowl                             |
| `cleanliness` | How tidy do you keep things?       | Süpürge, kova ve parıltılar                | a broom, a bucket and a spray bottle with sparkles around a shiny floor tile         |
| `sleep`       | When does your day start and end?  | Güneş ve ay, ortada çalar saat             | an alarm clock in the middle with a sun on one side and a crescent moon on the other |
| `guests`      | How often do you have guests over? | Kapı önünde ayakkabılar ve parti şapkası   | a doormat with several pairs of shoes and a party hat                                |
| `noise`       | How much noise is fine?            | Hoparlör ve kulaklık                       | a loudspeaker with sound waves on one side and a pair of headphones on the other     |
| `livingWith`  | Who would you like to live with?   | Yan yana iki koltuk ve sehpa               | two armchairs facing each other with a small table and two mugs between them         |
| `done`        | You are all set!                   | Anahtarlıkta anahtar, konfeti              | a house key on a keyring bursting out of confetti                                    |

Profil düzenlemeden tek tek açılan sorular için de birer çizim gerekir
(öncelik düşük):

| Kimlik      | Soru (EN)                         | "Subject:" satırı                                        |
| ----------- | --------------------------------- | -------------------------------------------------------- |
| `stay`      | How long do you plan to stay?     | an hourglass next to a suitcase                          |
| `social`    | How social are you at home?       | a sofa with a board game and two game controllers on it  |
| `homeDays`  | Are you home in the day?          | a desk by a window with a laptop and a plant in daylight |
| `sharing`   | What do you like to share?        | an open fridge with shelves of food and labelled jars    |
| `languages` | Which languages do you speak?     | two overlapping speech bubbles with abstract squiggles   |
| `interests` | What are you into?                | a guitar, a football and a paint palette                 |
| `bio`       | Anything else people should know? | an open notebook with a pencil                           |

## Koda bağlama

1. Görselleri `public/images/onboarding/<kimlik>.png` olarak ekleyin.
2. `Onboarding.tsx` içinde `.sticker` bloğunun yerine görseli koyun; görseli
   olmayan soru için ikonlu çıkartma yedek olarak kalsın:

   ```tsx
   <img
     className={o.art}
     src={`/images/onboarding/${question.id}.png`}
     alt=""
     width={360}
     height={240}
   />
   ```

3. `Onboarding.module.css` içine `.art` ekleyin: genişlik `min(100%, 22rem)`,
   `aspect-ratio: 3 / 2`, `object-fit: contain` ve mevcut `stick`
   animasyonu (çizim de zıplayarak gelsin).
4. Çizim dekoratif olduğu için `alt=""` kalmalı; soruyu başlık okuyor.
5. `npm run typecheck && npm run check:design` ve tarayıcı testlerini
   çalıştırın; açık ve koyu temada, en az iki palette gözle kontrol edin.

## Kabul ölçütleri

- 18 ana çizimin hepsi aynı çizgi kalınlığı ve aynı renklerle.
- Hiçbirinde yazı, insan figürü veya başka bir ürüne ait öğe yok.
- Açık ve koyu temada okunuyor.
- Telefon genişliğinde (390 piksel) soru başlığı ve ilk cevap, kaydırmadan
  görünüyor.
