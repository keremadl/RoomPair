"use client";
import { useEffect, useState } from "react";
import {
  Eyebrow,
  Heading,
  SegmentedControl,
  Stack,
  Text,
} from "@/design-system";
import {
  directionFontVariables,
  directions,
  type DirectionId,
} from "@/design-system/themes";
import { ChatScreen } from "./languages/chat";
import { CollageScreen } from "./languages/collage";
import { PosterScreen } from "./languages/poster";
import styles from "./directions.module.css";

function Swatch({ token }: { token: string }) {
  const [value, setValue] = useState("");
  return (
    <span
      className={styles.swatch}
      style={{ background: `var(${token})` }}
      title={value || token}
      ref={(el) => {
        if (el && !value)
          setValue(getComputedStyle(el).getPropertyValue(token).trim());
      }}
    />
  );
}

const screens: Record<DirectionId, () => React.ReactNode> = {
  chat: ChatScreen,
  collage: CollageScreen,
  poster: PosterScreen,
};

export function Directions() {
  const [selected, setSelected] = useState<DirectionId>("chat");
  const [palettes, setPalettes] = useState<
    Partial<Record<DirectionId, string>>
  >({});

  useEffect(() => {
    const sync = () => {
      const fromHash = window.location.hash.slice(1);
      if (directions.some((d) => d.id === fromHash))
        setSelected(fromHash as DirectionId);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className={`${styles.page} ${directionFontVariables}`}>
      <header className={styles.header}>
        <Eyebrow>RoomPair · Tasarım dilleri</Eyebrow>
        <Heading level={1} size="3xl">
          Keşfet ekranı, üç farklı dilde
        </Heading>
        <Text tone="muted" className={styles.lead}>
          Aynı içerik ve aynı eşleşme verisi; ama yerleşim, tipografi, biçim,
          hareket ve detayların anlatımı her birinde farklı. Kartı sağa/sola
          sürükleyin ya da butonları kullanın; detaylar için ekranın içinde
          aşağı kaydırın.
        </Text>
        <SegmentedControl
          label="Direction"
          className={styles.picker}
          fullWidth
          value={selected}
          onChange={(id) => {
            setSelected(id);
            history.replaceState(null, "", `#${id}`);
          }}
          options={directions.map((d) => ({ value: d.id, label: d.name }))}
        />
      </header>

      <div className={styles.grid}>
        {directions.map((direction) => {
          const Screen = screens[direction.id];
          return (
            <section
              key={direction.id}
              id={direction.id}
              data-direction={direction.id}
              data-palette={
                palettes[direction.id] ?? direction.palettes?.[0].id
              }
              data-selected={direction.id === selected}
              className={styles.direction}
              aria-label={direction.name}
            >
              <Stack gap={3} className={styles.about}>
                <Heading level={2} size="xl">
                  {direction.name}
                </Heading>
                <Text size="sm">{direction.idea}</Text>
                <dl className={styles.principles}>
                  {direction.principles.map((pr) => (
                    <div key={pr.label}>
                      <dt>{pr.label}</dt>
                      <dd>{pr.value}</dd>
                    </div>
                  ))}
                </dl>
                {direction.palettes ? (
                  <div
                    className={styles.palettes}
                    role="radiogroup"
                    aria-label={`${direction.name} renk paleti`}
                  >
                    {direction.palettes.map((palette) => {
                      const current =
                        (palettes[direction.id] ??
                          direction.palettes?.[0].id) === palette.id;
                      return (
                        <button
                          key={palette.id}
                          type="button"
                          role="radio"
                          aria-checked={current}
                          className={styles.palette}
                          onClick={() =>
                            setPalettes((p) => ({
                              ...p,
                              [direction.id]: palette.id,
                            }))
                          }
                        >
                          <span
                            className={styles.swatches}
                            data-direction={direction.id}
                            data-palette={palette.id}
                            aria-hidden="true"
                          >
                            {direction.swatches.map((t) => (
                              <Swatch key={t} token={t} />
                            ))}
                          </span>
                          {palette.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className={styles.swatches} aria-hidden="true">
                    {direction.swatches.map((t) => (
                      <Swatch key={t} token={t} />
                    ))}
                  </span>
                )}
              </Stack>
              <div className={styles.phone}>
                <Screen />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
