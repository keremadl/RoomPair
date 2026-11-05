"use client";
import { useEffect, useState } from "react";
import { PanelTop, Rows3 } from "lucide-react";
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
  screens,
  type DirectionId,
} from "@/design-system/languages";
import type { DetailsLayout } from "@/design-system/components/ProfileDetails/ProfileDetails";
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

export function Directions() {
  const [selected, setSelected] = useState<DirectionId>("chat");
  const [layout, setLayout] = useState<DetailsLayout>("blocks");
  const [palettes, setPalettes] = useState<
    Partial<Record<DirectionId, string>>
  >({});

  useEffect(() => {
    // #chat, #tabs or #chat-tabs
    const sync = () => {
      for (const part of window.location.hash.slice(1).split("-")) {
        if (directions.some((d) => d.id === part))
          setSelected(part as DirectionId);
        if (part === "blocks" || part === "tabs") setLayout(part);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className={`${styles.page} ${directionFontVariables}`}>
      <header className={styles.header}>
        <Eyebrow>RoomPair · Design languages</Eyebrow>
        <Heading level={1} size="3xl">
          The Discover screen in {directions.length} design languages
        </Heading>
        <Text tone="muted" className={styles.lead}>
          Same content, same match data. In every language the details sit in
          the same three groups: Home, Person, Fit. Use the switch below to put
          all six into the Blocks or Tabs layout. Drag the card left or right or
          use the buttons; scroll inside a screen for the details.
        </Text>
        <div
          className={styles.picker}
          role="radiogroup"
          aria-label="Design language"
        >
          {directions.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={selected === d.id}
              className={styles.pick}
              onClick={() => {
                setSelected(d.id);
                history.replaceState(null, "", `#${d.id}-${layout}`);
              }}
            >
              {d.name}
            </button>
          ))}
        </div>
        <div className={styles.layoutSwitch}>
          <span aria-hidden="true">Details layout</span>
          <SegmentedControl
            label="Details layout"
            value={layout}
            onChange={(next) => {
              setLayout(next);
              history.replaceState(null, "", `#${selected}-${next}`);
            }}
            options={[
              { value: "blocks", label: "1 · Blocks", icon: <Rows3 /> },
              { value: "tabs", label: "2 · Tabs", icon: <PanelTop /> },
            ]}
          />
        </div>
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
                    aria-label={`${direction.name} colour palette`}
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
                <Screen layout={layout} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
