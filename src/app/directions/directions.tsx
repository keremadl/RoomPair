"use client";
import { useEffect, useState } from "react";
import {
  Badge,
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
import { SwipeScreen } from "./swipe-screen";
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
  const [selected, setSelected] = useState<DirectionId>("courtyard");

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
        <Eyebrow>RoomPair · Design directions</Eyebrow>
        <Heading level={1} size="3xl">
          Pick a look for RoomPair
        </Heading>
        <Text tone="muted" className={styles.lead}>
          Same Discover screen, same components, same code. Only the design
          tokens change between the three. Drag a card left or right, or use the
          buttons.
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
        {directions.map((direction) => (
          <section
            key={direction.id}
            id={direction.id}
            data-direction={direction.id}
            data-selected={direction.id === selected}
            className={styles.direction}
            aria-label={direction.name}
          >
            <Stack gap={3} className={styles.about}>
              <Heading level={2} size="xl">
                {direction.name}
              </Heading>
              <Text size="sm" tone="muted">
                {direction.tagline}
              </Text>
              <Stack direction="row" gap={2} wrap>
                {direction.mood.map((m) => (
                  <Badge key={m}>{m}</Badge>
                ))}
              </Stack>
              <Stack direction="row" gap={3} align="center">
                <span className={styles.swatches}>
                  {direction.swatches.map((t) => (
                    <Swatch key={t} token={t} />
                  ))}
                </span>
                <Text size="xs" tone="muted">
                  {direction.fonts.heading} / {direction.fonts.body}
                </Text>
              </Stack>
            </Stack>
            <div className={styles.phone}>
              <SwipeScreen />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
