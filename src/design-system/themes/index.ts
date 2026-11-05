import "./chat.css";
import "./collage.css";
import "./collage-forest.css";
import "./collage-sunset.css";
import "./collage-night.css";
import "./poster.css";

export { directionFontVariables } from "./fonts";

export type DirectionId = "chat" | "collage" | "poster";

/** Swatches are read from the palette's own token file, so colours live in CSS only. */
export type Palette = { id: string; name: string };

export type Direction = {
  id: DirectionId;
  name: string;
  idea: string;
  /** What makes this a different design language, not just a palette. */
  principles: { label: string; value: string }[];
  swatches: string[];
  /** Optional colour palettes for the same language. The first is the default. */
  palettes?: Palette[];
};

export const directions: Direction[] = [
  {
    id: "chat",
    name: "A · Sohbet",
    idea: "Profili, müstakbel ev arkadaşınla ilk mesajlaşman gibi okursun.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Fotoğraf kartı, altında soru–cevap baloncukları: kira, taşınma, oda, alışkanlıklar.",
      },
      {
        label: "Tipografi",
        value:
          "Atkinson Hyperlegible: okuma güçlüğü için tasarlanmış font. 17px gövde, geniş satır aralığı.",
      },
      {
        label: "Biçim",
        value:
          "Yumuşak köşeler, sola hizalı baloncuklar; italik ve büyük harf yok.",
      },
      {
        label: "Hareket",
        value: "Yeni profilde mesajlar sırayla belirir, kart hafifçe döner.",
      },
      {
        label: "Detaylar",
        value:
          "Alışkanlıklar cevap içinde, her satırda 'senle aynı' ya da senin tercihin.",
      },
    ],
    swatches: [
      "--color-bg",
      "--color-primary",
      "--bubble-you",
      "--color-accent",
    ],
  },
  {
    id: "collage",
    name: "B · Kolaj",
    idea: "Yurt odasındaki buzdolabı kapağı: polaroidler, çıkartmalar, kişilik önde.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Hafif eğik polaroid ve üstüne yapışmış çıkartmalar. Detaylar konuşma balonu ve renkli bloklarla.",
      },
      {
        label: "Tipografi",
        value:
          "Kalın, karakterli grotesk (Bricolage Grotesque 800) ve Figtree.",
      },
      {
        label: "Biçim",
        value:
          "2px kontur, sert ofset gölge, cömert yuvarlaklık, doygun çıkartma renkleri.",
      },
      {
        label: "Hareket",
        value:
          "Esnek, zıplayan yay. Kart sürüklenirken belirgin şekilde döner.",
      },
      {
        label: "Detaylar",
        value:
          "Alışkanlıklar blok metrelerle 'o ve sen'; uyum kalın renkli barlarla.",
      },
    ],
    swatches: [
      "--color-bg",
      "--color-primary",
      "--sticker-lime",
      "--sticker-pink",
    ],
    palettes: [
      { id: "lavender", name: "Lavanta" },
      { id: "forest", name: "Orman" },
      { id: "sunset", name: "Gün batımı" },
      { id: "night", name: "Gece" },
    ],
  },
  {
    id: "poster",
    name: "C · Afiş",
    idea: "Bir konser afişi kadar net: düz renk bantları, dev rakamlar, tek bakışta okunur.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Kare fotoğraf, altında tam genişlik renk bantları ve 2×2 dev rakam ızgarası.",
      },
      {
        label: "Tipografi",
        value: "Archivo Black başlıklar ve büyük rakamlar, Archivo gövde.",
      },
      {
        label: "Biçim",
        value: "Köşesiz, gölgesiz, konturusuz; sadece düz renk alanları.",
      },
      {
        label: "Hareket",
        value: "Hızlı ve net: dönme yok, kart bir anda kayıp gider.",
      },
      {
        label: "Detaylar",
        value:
          "Alışkanlıklar dev rakamlarla yan yana (o / sen); altta ekranı ikiye bölen Pass / Like.",
      },
    ],
    swatches: ["--band-red", "--band-sky", "--band-mint", "--band-ink"],
  },
];
