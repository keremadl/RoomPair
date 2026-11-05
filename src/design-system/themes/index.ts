import "./listing.css";
import "./collage.css";
import "./immersive.css";

export { directionFontVariables } from "./fonts";

export type DirectionId = "listing" | "collage" | "immersive";

export type Direction = {
  id: DirectionId;
  name: string;
  idea: string;
  /** What makes this a different design language, not just a palette. */
  principles: { label: string; value: string }[];
  swatches: string[];
};

export const directions: Direction[] = [
  {
    id: "listing",
    name: "A · İlan",
    idea: "Özenle dizilmiş, basılı bir oda ilanı gibi: önce oku, sonra beğen.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Belge akışı. Fotoğraf çerçeveli bir levha; bilgiler etiket–değer tablolarında, ince çizgilerle ayrılmış.",
      },
      {
        label: "Tipografi",
        value:
          "Serif başlıklar (Newsreader), sade gövde (Public Sans), etiketlerde mono (IBM Plex Mono).",
      },
      {
        label: "Biçim",
        value:
          "Neredeyse köşesiz, gölgesiz. Hiyerarşiyi kutular değil çizgiler ve boşluk kurar.",
      },
      {
        label: "Hareket",
        value: "Sayfa çevirir gibi yana kayma; dönme yok, sakin.",
      },
      {
        label: "Detaylar",
        value:
          "Alışkanlıklar 'o / sen' tablosu; uyum puanı ağırlıklarıyla birlikte bir defter gibi.",
      },
    ],
    swatches: [
      "--color-bg",
      "--color-text",
      "--color-accent",
      "--color-border-strong",
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
          "2px mürekkep kontur, sert ofset gölge, cömert yuvarlaklık, doygun çıkartma renkleri.",
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
  },
  {
    id: "immersive",
    name: "C · Akış",
    idea: "Akşamüstü birinin evine adım atmak: fotoğraf tam ekran, arayüz geri çekilir.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Tam ekran fotoğraf ve hikâye çubukları. Aşağı kaydırınca bulanık fotoğrafın üstünde cam paneller.",
      },
      {
        label: "Tipografi",
        value:
          "İnce, geniş geometrik başlıklar (Sora Light) ve Hanken Grotesk.",
      },
      {
        label: "Biçim",
        value: "Koyu zemin, buzlu cam yüzeyler, yüzen aksiyon kapsülü.",
      },
      {
        label: "Hareket",
        value: "Sinematik, yumuşak geçişler; içerik kaydırdıkça belirir.",
      },
      {
        label: "Detaylar",
        value:
          "Alışkanlıklar iki noktalı ritim çizgilerinde (sen / o); pratik bilgiler ikon satırlarında.",
      },
    ],
    swatches: [
      "--color-bg",
      "--color-primary",
      "--color-accent",
      "--color-text",
    ],
  },
];
