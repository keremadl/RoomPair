/**
 * Registry of RoomPair's design languages. Each language is a package in
 * this folder (theme tokens, signature components, Discover screen, README);
 * this file lists them for pages that switch between languages.
 */
import type { ComponentType } from "react";
import type { DetailsLayout } from "../components/ProfileDetails/ProfileDetails";
import * as chat from "./chat";
import * as collage from "./collage";
import * as poster from "./poster";
import * as day from "./day";
import * as plan from "./plan";
import * as card from "./card";

export { directionFontVariables } from "./fonts";

export type DirectionId =
  "chat" | "collage" | "poster" | "day" | "plan" | "card";

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
  {
    id: "day",
    name: "D · Gün",
    idea: "Profili, onunla paylaşacağın sıradan bir gün olarak okursun.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Fotoğraf kartı, altında sabahtan geceye bir zaman çizelgesi; takvim ve bütçe çubuğu.",
      },
      {
        label: "Tipografi",
        value:
          "Lexend: okuma akıcılığı için tasarlanmış font. Sakin, geniş aralıklı.",
      },
      {
        label: "Biçim",
        value:
          "Yumuşak kartlar; renkler anlam taşır: sabah, öğlen, akşam, gece.",
      },
      {
        label: "Hareket",
        value: "Yumuşak; kart hafifçe döner, çizelge yeni profille yenilenir.",
      },
      {
        label: "Detaylar",
        value:
          "Uyanma, akşamlar, düzen ve sessiz saatler senin gününle yan yana: 'aynı' ya da 'biraz farklı'.",
      },
    ],
    swatches: [
      "--color-bg",
      "--time-morning",
      "--time-evening",
      "--time-night",
    ],
  },
  {
    id: "plan",
    name: "E · Ev Planı",
    idea: "Paylaşacağınız ev bir mimari çizim; bilgiler teknik bir şartname kadar net.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Etiket sekmeli fotoğraf; detaylar numaralı çizim paftaları gibi: 01 Ev, 02 Kişi, 03 Uyum.",
      },
      {
        label: "Tipografi",
        value: "Schibsted Grotesk: net, teknik ama sıcak bir grotesk.",
      },
      {
        label: "Biçim",
        value:
          "Lacivert çizgiler, çizim kağıdı ızgarası, tek mercan vurgu: senin odan.",
      },
      {
        label: "Hareket",
        value: "Az ve net; odalar arası geçiş kısa bir solma.",
      },
      {
        label: "Detaylar",
        value:
          "Ev paftasında kat planı ve senin odan vurgulu; kişi ve alışkanlıklar ayrı bir şartname tablosunda.",
      },
    ],
    swatches: ["--color-bg", "--plan-line", "--color-accent", "--plan-yours"],
  },
  {
    id: "card",
    name: "F · Kart",
    idea: "Herkes bir oyun karakter kartı: seviye, statlar, yetenekler, görevler.",
    principles: [
      {
        label: "Yerleşim",
        value:
          "Tür rengine göre çerçeveli kart; altında 'sen vs o' statları, eşya kartı olarak oda.",
      },
      {
        label: "Tipografi",
        value: "Rubik: yuvarlak hatlı, kalın ama tam boyda okunaklı.",
      },
      {
        label: "Biçim",
        value:
          "Kalın kontur, basılabilir 3B butonlar, stat pipleri, XP çubuğu.",
      },
      {
        label: "Hareket",
        value: "Oyunsu ve zıplayan; butonlar basınca çöker.",
      },
      {
        label: "Detaylar",
        value:
          "Uyum = XP; eşleşme gerekçeleri tamamlanmış, konuşulacaklar açık görevler.",
      },
    ],
    swatches: ["--type-host", "--type-explorer", "--color-primary", "--xp"],
  },
];

/** Each language's Discover screen. */
export const screens: Record<
  DirectionId,
  ComponentType<{ layout?: DetailsLayout }>
> = {
  chat: chat.DiscoverScreen,
  collage: collage.DiscoverScreen,
  poster: poster.DiscoverScreen,
  day: day.DiscoverScreen,
  plan: plan.DiscoverScreen,
  card: card.DiscoverScreen,
};

/**
 * Each language's controlled Discover parts, for apps that own the deck:
 * Card (swipe + actions) and Details (Home → Person → Fit).
 */
export const discoverParts = {
  chat: { Card: chat.DiscoverCard, Details: chat.DiscoverDetails },
  collage: { Card: collage.DiscoverCard, Details: collage.DiscoverDetails },
  poster: { Card: poster.DiscoverCard, Details: poster.DiscoverDetails },
  day: { Card: day.DiscoverCard, Details: day.DiscoverDetails },
  plan: { Card: plan.DiscoverCard, Details: plan.DiscoverDetails },
  card: { Card: card.DiscoverCard, Details: card.DiscoverDetails },
} satisfies Record<DirectionId, { Card: unknown; Details: unknown }>;

/** Signature components: what each language adds on top of the shared core. */
export const signatures: Record<
  DirectionId,
  { name: string; purpose: string }[]
> = {
  chat: [
    {
      name: "Divider",
      purpose: "Section divider pill, like a date line in a chat app.",
    },
    {
      name: "Thread",
      purpose:
        "Question and answer bubbles; yours on the right, theirs on the left.",
    },
    {
      name: "HomeThread",
      purpose: "Home group: facts card, then the room as a photo bubble.",
    },
    {
      name: "PersonThread",
      purpose: "Person group: bio, interests, prompt and habits as replies.",
    },
    {
      name: "FitCard",
      purpose: "Fit group: score, reasons and the expandable breakdown.",
    },
  ],
  collage: [
    {
      name: "GroupTitle",
      purpose: "Tilted sticker heading, one colour per group.",
    },
    { name: "Blocks", purpose: "Five-step block meter for a 1–5 habit." },
    {
      name: "HomeStickers",
      purpose: "Home group: fact stickers and the room as a taped polaroid.",
    },
    {
      name: "PersonStickers",
      purpose: "Person group: speech bubble, vibe meters and lifestyle tiles.",
    },
    { name: "FitBars", purpose: "Fit group: chunky outlined score bars." },
  ],
  poster: [
    { name: "Band", purpose: "Full-width colour band that opens a group." },
    {
      name: "HomeBands",
      purpose: "Home group: 2×2 numeral tiles and the room on an ink band.",
    },
    {
      name: "PersonBands",
      purpose: "Person group: bio, prompt band and the numeral habit table.",
    },
    { name: "FitBand", purpose: "Fit group: giant score and thick bars." },
  ],
  day: [
    { name: "GroupTitle", purpose: "Heading with a time-of-day icon chip." },
    {
      name: "Moment",
      purpose: "One entry on the day timeline, marked same or different.",
    },
    {
      name: "MoveCalendar",
      purpose: "Month view with their move-in date and yours.",
    },
    {
      name: "BudgetBar",
      purpose: "Rent (or their range) against your budget.",
    },
  ],
  plan: [
    {
      name: "SheetTitle",
      purpose: "Numbered drawing-sheet heading: 01 Home, 02 Person, 03 Fit.",
    },
    {
      name: "FlatDrawing",
      purpose: "SVG floor plan of the flat, your room highlighted.",
    },
    {
      name: "SpecTable",
      purpose: "Label and value rows, like a specification.",
    },
    {
      name: "HomeSpec / PersonSpec",
      purpose: "Home and Person groups as drawing and spec tables.",
    },
    { name: "Fit", purpose: "Fit group: score and bar table." },
  ],
  card: [
    {
      name: "Banner",
      purpose: "Game-style heading with a pressed icon badge.",
    },
    { name: "Stat", purpose: "Stat pips on the character card." },
    { name: "Versus", purpose: "Their stat and yours as two pip rows." },
    { name: "Trait", purpose: "A trait row, ticked when it works with you." },
    { name: "HomeItem", purpose: "The room as an item card with fact coins." },
  ],
};
