"use client";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Building2,
  Heart,
  Leaf,
  MapPin,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Chip,
  Eyebrow,
  Heading,
  IconButton,
  Input,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
} from "@/design-system";
import styles from "./showcase.module.css";

const colorGroups: { title: string; tokens: string[] }[] = [
  {
    title: "Surfaces",
    tokens: [
      "--color-bg",
      "--color-surface",
      "--color-surface-raised",
      "--color-surface-sunken",
    ],
  },
  {
    title: "Text",
    tokens: ["--color-text", "--color-text-muted", "--color-text-subtle"],
  },
  {
    title: "Brand",
    tokens: [
      "--color-primary",
      "--color-primary-hover",
      "--color-primary-soft",
      "--color-accent",
      "--color-accent-strong",
      "--color-accent-soft",
    ],
  },
  {
    title: "Status & lines",
    tokens: [
      "--color-success",
      "--color-warning",
      "--color-danger",
      "--color-danger-soft",
      "--color-border",
      "--color-border-strong",
    ],
  },
];

const ramps = ["green", "neutral", "coral"] as const;
const rampSteps: Record<(typeof ramps)[number], (string | number)[]> = {
  green: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  neutral: [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  coral: [50, 100, 200, 300, 400, 500, 600, 700],
};

const typeScale = ["4xl", "3xl", "2xl", "xl", "lg", "md", "sm", "xs"] as const;
const spaceScale = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
const radii = ["sm", "md", "lg", "xl", "full"];
const shadows = ["sm", "md", "lg", "overlay"];

const sections = [
  ["colors", "Color"],
  ["type", "Typography"],
  ["space", "Space & shape"],
  ["buttons", "Buttons"],
  ["labels", "Badges & chips"],
  ["forms", "Forms"],
  ["display", "Avatars & cards"],
  ["pattern", "Composition"],
] as const;

function useTokenValue(token: string) {
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(
      getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
    );
  }, [token]);
  return value;
}

function Swatch({ token }: { token: string }) {
  const value = useTokenValue(token);
  return (
    <div className={styles.swatch}>
      <span
        className={styles.swatchColor}
        style={{ background: `var(${token})` }}
      />
      <code>{token}</code>
      <span className={styles.swatchValue}>{value}</span>
    </div>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section}>
      <Stack gap={2} className={styles.sectionHead}>
        <Heading level={2} size="2xl">
          {title}
        </Heading>
        <Text tone="muted">{intro}</Text>
      </Stack>
      {children}
    </section>
  );
}

function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.specimen}>
      <Text
        as="span"
        size="xs"
        tone="muted"
        weight="medium"
        className={styles.specimenLabel}
      >
        {label}
      </Text>
      <div className={styles.specimenBody}>{children}</div>
    </div>
  );
}

export function Showcase() {
  const [mode, setMode] = useState<"people" | "rooms">("people");
  const [habits, setHabits] = useState<string[]>(["Early riser"]);
  const toggleHabit = (habit: string) =>
    setHabits((current) =>
      current.includes(habit)
        ? current.filter((h) => h !== habit)
        : [...current, habit],
    );

  return (
    <div className={styles.page}>
      <aside className={styles.nav}>
        <Stack gap={1}>
          <Text weight="semibold">RoomPair</Text>
          <Text size="sm" tone="muted">
            Design system
          </Text>
        </Stack>
        <nav aria-label="Sections">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <Text size="xs" tone="muted">
          Source: <code>src/design-system</code>
        </Text>
      </aside>

      <main className={styles.main}>
        <header className={styles.hero}>
          <Eyebrow>Design system · v0.1</Eyebrow>
          <Heading level={1} size="4xl">
            One language for RoomPair.
          </Heading>
          <Text size="lg" tone="muted" className={styles.lead}>
            Tokens and components every screen is built from. If something you
            need is missing, add it here first — never style it inline in a
            screen.
          </Text>
        </header>

        <Section
          id="colors"
          title="Color"
          intro="Screens use semantic tokens (left). Primitive ramps (below) exist only to feed them."
        >
          <div className={styles.colorGroups}>
            {colorGroups.map((group) => (
              <Stack key={group.title} gap={3}>
                <Eyebrow>{group.title}</Eyebrow>
                {group.tokens.map((token) => (
                  <Swatch key={token} token={token} />
                ))}
              </Stack>
            ))}
          </div>
          <Stack gap={3}>
            {ramps.map((ramp) => (
              <div key={ramp} className={styles.ramp}>
                <Text
                  as="span"
                  size="sm"
                  weight="medium"
                  className={styles.rampName}
                >
                  {ramp}
                </Text>
                {rampSteps[ramp].map((step) => (
                  <span
                    key={step}
                    className={styles.rampStep}
                    style={{ background: `var(--rp-${ramp}-${step})` }}
                    title={`--rp-${ramp}-${step}`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            ))}
          </Stack>
        </Section>

        <Section
          id="type"
          title="Typography"
          intro="Manrope for headings, DM Sans for everything else. Eight sizes; 12px is the floor."
        >
          <Stack gap={4}>
            {typeScale.map((size) => (
              <div key={size} className={styles.typeRow}>
                <code>--text-{size}</code>
                <span
                  style={{
                    fontSize: `var(--text-${size})`,
                    fontFamily: ["4xl", "3xl", "2xl", "xl"].includes(size)
                      ? "var(--font-heading)"
                      : undefined,
                    fontWeight: ["4xl", "3xl", "2xl", "xl"].includes(size)
                      ? 700
                      : 400,
                    letterSpacing: ["4xl", "3xl", "2xl"].includes(size)
                      ? "var(--tracking-tight)"
                      : undefined,
                  }}
                >
                  Good people. Better living.
                </span>
              </div>
            ))}
          </Stack>
          <Card padding="lg">
            <Stack gap={3}>
              <Eyebrow>Eyebrow</Eyebrow>
              <Heading level={3}>Heading level 3</Heading>
              <Text>
                Body text in DM Sans at 16px. A kitchen you can linger in.
                Someone asking if you want tea. Plants that are mostly still
                alive.
              </Text>
              <Text size="sm" tone="muted">
                Muted secondary text for supporting details.
              </Text>
            </Stack>
          </Card>
        </Section>

        <Section
          id="space"
          title="Space & shape"
          intro="4px grid. Five radii, four elevations — pick one, don't invent."
        >
          <Stack gap={2}>
            {spaceScale.map((step) => (
              <div key={step} className={styles.spaceRow}>
                <code>--space-{step}</code>
                <span
                  className={styles.spaceBar}
                  style={{ width: `var(--space-${step})` }}
                />
              </div>
            ))}
          </Stack>
          <div className={styles.shapeGrid}>
            {radii.map((r) => (
              <div
                key={r}
                className={styles.shapeTile}
                style={{ borderRadius: `var(--radius-${r})` }}
              >
                <code>--radius-{r}</code>
              </div>
            ))}
          </div>
          <div className={styles.shapeGrid}>
            {shadows.map((s) => (
              <div
                key={s}
                className={styles.shadowTile}
                style={{ boxShadow: `var(--shadow-${s})` }}
              >
                <code>--shadow-{s}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          intro="One primary action per view. Icon-only buttons always carry a label."
        >
          <Specimen label="Variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </Specimen>
          <Specimen label="Sizes & icons">
            <Button size="sm">Small</Button>
            <Button trailingIcon={<ArrowUpRight />}>Medium</Button>
            <Button size="lg" leadingIcon={<Heart />}>
              Large
            </Button>
          </Specimen>
          <Specimen label="IconButton — ghost / outline / solid">
            <IconButton label="More options" icon={<MoreHorizontal />} />
            <IconButton label="Undo" icon={<RotateCcw />} variant="outline" />
            <IconButton label="Pass" icon={<X />} variant="outline" size="lg" />
            <IconButton
              label="Like"
              icon={<Heart />}
              variant="solid"
              size="lg"
            />
            <IconButton
              label="Super like"
              icon={<Sparkles />}
              variant="outline"
            />
          </Specimen>
        </Section>

        <Section
          id="labels"
          title="Badges & chips"
          intro="Badges label; chips toggle. Don't use a chip for something you can't press."
        >
          <Specimen label="Badge tones">
            <Badge>Neutral</Badge>
            <Badge tone="primary">5</Badge>
            <Badge tone="accent">New</Badge>
            <Badge tone="success" dot>
              Has a room
            </Badge>
            <Badge tone="warning">Pending</Badge>
            <Badge tone="danger">Reported</Badge>
          </Specimen>
          <Specimen label="Chip — click to toggle">
            {["Early riser", "Plant parent", "Night owl", "Cooks often"].map(
              (habit) => (
                <Chip
                  key={habit}
                  selected={habits.includes(habit)}
                  onClick={() => toggleHabit(habit)}
                  icon={
                    habit === "Plant parent" ? (
                      <Leaf />
                    ) : habit === "Early riser" ? (
                      <Sun />
                    ) : undefined
                  }
                >
                  {habit}
                </Chip>
              ),
            )}
          </Specimen>
          <Specimen label="Chip on image">
            <div className={styles.imageBackdrop}>
              <Chip surface="onImage" icon={<Leaf />}>
                Plant parent
              </Chip>
              <Chip surface="onImage">Slow mornings</Chip>
            </div>
          </Specimen>
          <Specimen label="SegmentedControl">
            <SegmentedControl
              label="Search mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: "people", label: "Find people", icon: <Users /> },
                { value: "rooms", label: "Find a room", icon: <Building2 /> },
              ]}
            />
          </Specimen>
        </Section>

        <Section
          id="forms"
          title="Forms"
          intro="Every field has a visible label. Hints explain, errors say how to fix."
        >
          <div className={styles.formGrid}>
            <Input
              label="Your first name"
              placeholder="Alex"
              hint="Shown on your profile."
            />
            <Input
              label="Monthly budget"
              prefix="€"
              inputMode="numeric"
              defaultValue="420"
            />
            <Input
              label="Student email"
              defaultValue="alex@"
              error="Enter a full university email address."
            />
            <Textarea
              label="A small thing that makes a home"
              placeholder="A kitchen you can linger in…"
            />
          </div>
        </Section>

        <Section
          id="display"
          title="Avatars & cards"
          intro="Cards group related content. Three variants, no custom shadows."
        >
          <Specimen label="Avatar sizes">
            <Avatar name="Ella Berzina" src="/images/ella.jpg" size="sm" />
            <Avatar name="Ella Berzina" src="/images/ella.jpg" />
            <Avatar name="Alex Kaya" size="lg" />
            <Avatar name="Noah" src="/images/noah.jpg" size="xl" />
            <AvatarGroup>
              <Avatar name="Leo" src="/images/leo.jpg" size="sm" />
              <Avatar name="Maya" src="/images/maya.jpg" size="sm" />
              <Avatar name="Felix" src="/images/felix.jpg" size="sm" />
            </AvatarGroup>
          </Specimen>
          <div className={styles.cardGrid}>
            <Card>
              <Stack gap={2}>
                <Text weight="semibold">Outline</Text>
                <Text size="sm" tone="muted">
                  Default. Sits on the page background.
                </Text>
              </Stack>
            </Card>
            <Card variant="raised">
              <Stack gap={2}>
                <Text weight="semibold">Raised</Text>
                <Text size="sm" tone="muted">
                  Floating content, focus of the screen.
                </Text>
              </Stack>
            </Card>
            <Card variant="sunken">
              <Stack gap={2}>
                <Text weight="semibold">Sunken</Text>
                <Text size="sm" tone="muted">
                  Secondary panels and grouped settings.
                </Text>
              </Stack>
            </Card>
          </div>
        </Section>

        <Section
          id="pattern"
          title="Composition"
          intro="A profile summary built only from primitives above — no new CSS. Screens should look like this in code."
        >
          <Card variant="raised" padding="none" className={styles.profileCard}>
            <img
              src="/images/ella.jpg"
              alt=""
              className={styles.profilePhoto}
            />
            <Stack gap={4} className={styles.profileBody}>
              <Stack direction="row" justify="space-between" align="center">
                <Badge tone="success" dot>
                  Has a room
                </Badge>
                <IconButton
                  label="More options"
                  icon={<MoreHorizontal />}
                  size="sm"
                />
              </Stack>
              <Stack gap={1}>
                <Heading level={3}>Ella, 23</Heading>
                <Text size="sm" tone="muted">
                  <MapPin size={14} style={{ verticalAlign: "-2px" }} />{" "}
                  Āgenskalns, Riga · €420 / month
                </Text>
              </Stack>
              <Text size="sm">
                Design student, weekend market regular, always brings home one
                more plant.
              </Text>
              <Stack direction="row" gap={2} wrap>
                <Chip icon={<Leaf />}>Plant parent</Chip>
                <Chip>Slow mornings</Chip>
              </Stack>
              <Stack direction="row" gap={3}>
                <Button variant="secondary" fullWidth leadingIcon={<X />}>
                  Pass
                </Button>
                <Button fullWidth leadingIcon={<Heart />}>
                  Like
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Section>
      </main>
    </div>
  );
}
