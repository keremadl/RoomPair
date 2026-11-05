"use client";
import { useEffect, useState } from "react";
import { Eyebrow, Heading, Text } from "@/design-system";
import "@/design-system/themes/wire.css";
import { groupIcon, type Group } from "./blocks";
import { BlocksPrototype, TabsPrototype } from "./prototypes";
import styles from "./layouts.module.css";

const model: {
  group: Group;
  name: string;
  question: string;
  fields: string[];
}[] = [
  {
    group: "home",
    name: "Ev",
    question: "Ev nasıl?",
    fields: [
      "Kira (faturalar dahil) ya da arama bütçesi",
      "Müsait olduğu tarih / taşınma",
      "Minimum kalış süresi",
      "Semt",
      "Odanın fotoğrafı, başlığı, açıklaması",
    ],
  },
  {
    group: "person",
    name: "Kişi",
    question: "Kiminle yaşayacağım?",
    fields: [
      "Okul / bölüm, yaş, doğrulama",
      "Kendini anlatışı (bio)",
      "İlgi alanları",
      "Profil sorusu ve cevabı",
      "Alışkanlıklar: düzen, sosyallik, uyku, sigara, evcil hayvan (seninle karşılaştırmalı)",
    ],
  },
  {
    group: "fit",
    name: "Uyum",
    question: "Anlaşır mıyız?",
    fields: [
      "Uyum puanı",
      "Uyan noktalar",
      "Konuşulması gerekenler",
      "Puanın dökümü",
    ],
  },
];

const prototypes = [
  {
    id: "blocks",
    name: "1 · Bloklar",
    idea: "Ev → Kişi → Uyum, her biri kendi başlığı ve rengiyle alt alta. Her blok kendi başlığı ve temel bilgi kutularıyla başlar.",
    pros: [
      "Her şey görünür, hiçbir şey gizli değil",
      "Sıra hep aynı: göz nereye bakacağını öğrenir",
      "Altı tasarım diline en kolay uyan düzen",
    ],
    cons: ["Sayfa uzun; Uyum'a ulaşmak için kaydırmak gerekir"],
    recommended: true,
    Screen: BlocksPrototype,
  },
  {
    id: "tabs",
    name: "2 · Sekmeler",
    idea: "Kartın altında Oda / Kişi / Uyum sekmeleri. Aynı anda tek grup görünür.",
    pros: [
      "En sakin görünüm; karışıklık imkânsız",
      "İstediğin gruba tek dokunuşla gidersin",
    ],
    cons: [
      "Diğer sekmeleri hiç açmayan kişi bilgileri kaçırır",
      "Karşılaştırmak için sekmeler arası gidip gelmek gerekir",
    ],
    Screen: TabsPrototype,
  },
];

export function Layouts() {
  const [selected, setSelected] = useState(prototypes[0].id);
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (prototypes.some((p) => p.id === h)) setSelected(h);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Eyebrow>RoomPair · Düzen prototipleri</Eyebrow>
        <Heading level={1} size="3xl">
          Profil bilgileri nasıl dizilsin?
        </Heading>
        <Text tone="muted" className={styles.lead}>
          RoomPair bir flört uygulaması değil: kullanıcı iki ayrı soruya cevap
          arıyor. Önce her bilgiyi tek bir gruba yerleştirdik, sonra bu
          grupların ekranda dizilişini dört farklı şekilde denedik. Prototipler
          bilerek renksiz; tartışma tasarım diline değil düzene odaklansın.
        </Text>
      </header>

      <section className={styles.model} aria-labelledby="model-title">
        <h2 id="model-title" className={styles.sectionTitle}>
          İçerik modeli: her bilgi tek bir grupta
        </h2>
        <div className={styles.modelGrid} data-direction="wire">
          {model.map((g) => (
            <div
              key={g.group}
              className={styles.modelCard}
              data-group={g.group}
            >
              <p className={styles.modelHead}>
                <span>{groupIcon[g.group]}</span>
                {g.name}
              </p>
              <p className={styles.modelQuestion}>{g.question}</p>
              <ul>
                {g.fields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={styles.rule}>
          Kural: evle ilgili hiçbir bilgi Kişi grubunda, kişiyle ilgili hiçbir
          bilgi Ev grubunda durmaz. Odası olmayan biri için Ev grubu
          &ldquo;aradığı ev&rdquo;i gösterir: bütçe, semt, tarih, süre.
        </p>
      </section>

      <div className={styles.picker} role="radiogroup" aria-label="Prototip">
        {prototypes.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected === p.id}
            className={styles.pick}
            onClick={() => {
              setSelected(p.id);
              history.replaceState(null, "", `#${p.id}`);
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {prototypes.map(
          ({ id, name, idea, pros, cons, recommended, Screen }) => (
            <section
              key={id}
              id={id}
              className={styles.proto}
              data-selected={selected === id}
              aria-label={name}
            >
              <div className={styles.about}>
                <h2 className={styles.protoName}>
                  {name}
                  {recommended && (
                    <span className={styles.badge}>Önerimiz</span>
                  )}
                </h2>
                <p className={styles.idea}>{idea}</p>
                <div className={styles.lists}>
                  <div>
                    <p className={styles.listTitle}>Artıları</p>
                    <ul>
                      {pros.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className={styles.listTitle}>Eksileri</p>
                    <ul>
                      {cons.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className={styles.phone} data-direction="wire">
                <Screen />
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
