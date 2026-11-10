"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  Building2,
  Heart,
  Leaf,
  MapPin,
  MoreHorizontal,
  RotateCcw,
  Settings,
  UserPen,
  Sparkles,
  Sun,
  Handshake,
  Home,
  UserRound,
  Users,
  X,
} from "@/design-system/icons";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Chip,
  Eyebrow,
  TextLink,
  Heading,
  IconButton,
  Input,
  SegmentedControl,
  ChoiceCards,
  TopBar,
  Progress,
  EmptyState,
  ListGroup,
  ListRow,
  Stack,
  Text,
  Textarea,
  SectionHeader,
  FactGrid,
  CompareTable,
  ScoreBars,
  ReasonList,
  Tabs,
  Icons,
  PageTransition,
  Stagger,
  type PageMotion,
} from "@/design-system";
import {
  directionFontVariables,
  directions,
  screens,
  signatures,
  type DirectionId,
} from "@/design-system/languages";
import { profiles, defaultPreferences } from "@/lib/data";
import { getCompatibility } from "@/lib/matching";
import {
  fitSection,
  homeSection,
  personSection,
} from "@/lib/discover/sections";
import { MatchScreen } from "@/design-system/languages/card/MatchScreen";
import { DeckEnd } from "@/design-system/languages/card/DeckEnd";
import styles from "./showcase.module.css";

type LangId = "base" | DirectionId;

/** Sample content for the detail-block specimens: the first demo profile. */
const sample = profiles[0];
const sampleHome = homeSection(sample);
const samplePerson = personSection(sample);
const sampleFit = fitSection(
  getCompatibility(sample, { ...defaultPreferences, intent: "either" }),
);

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
  ["motion", "Motion"],
  ["icons", "Icons"],
  ["labels", "Badges & chips"],
  ["forms", "Forms"],
  ["display", "Avatars & cards"],
  ["details", "Detail blocks"],
  ["signature", "Signature components"],
  ["screens", "Discover screen"],
  ["pattern", "Composition"],
] as const;

/** Reads a token's value where it is rendered, so language themes show their own values. */
function Swatch({ token, scope }: { token: string; scope: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  useLayoutEffect(() => {
    if (ref.current)
      setValue(getComputedStyle(ref.current).getPropertyValue(token).trim());
  }, [token, scope]);
  return (
    <div className={styles.swatch} ref={ref}>
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

const motionTokens = [
  "--duration-fast",
  "--duration-base",
  "--duration-slow",
  "--duration-page",
  "--ease-standard",
  "--ease-page",
  "--motion-distance-page",
  "--motion-distance-rise",
  "--stagger-step",
];

/** A token and its value where it is rendered (no colour swatch). */
function TokenValue({ token }: { token: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  useLayoutEffect(() => {
    if (ref.current)
      setValue(getComputedStyle(ref.current).getPropertyValue(token).trim());
  }, [token]);
  return (
    <div className={styles.swatch} ref={ref}>
      <code>{token}</code>
      <span className={styles.swatchValue}>{value}</span>
    </div>
  );
}

/** PageTransition: push a sub-page, pop back, or fade to another tab. */
function PageTransitionSpecimen() {
  const [page, setPage] = useState<{ name: string; motion: PageMotion }>({
    name: "Likes",
    motion: "fade",
  });
  const go = (name: string, motion: PageMotion) => setPage({ name, motion });
  return (
    <div className={styles.stackWide}>
      <Stack direction="row" gap={2} wrap>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => go("Ella", "push")}
        >
          Push a sub-page
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => go("Likes", "pop")}
        >
          Back (pop)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            go(page.name === "Messages" ? "Likes" : "Messages", "fade")
          }
        >
          Another tab (fade)
        </Button>
      </Stack>
      <div className={styles.pageFrame}>
        <TopBar
          title={page.name}
          onBack={page.name === "Ella" ? () => go("Likes", "pop") : undefined}
        />
        <PageTransition
          transitionKey={page.name}
          motion={page.motion}
          className={styles.pageBody}
        >
          <Text tone="muted">
            {page.name === "Ella"
              ? "A sub-page slides in from the right; back slides the page underneath in from the left."
              : `The ${page.name} tab fades in.`}
          </Text>
        </PageTransition>
      </div>
    </div>
  );
}

/** Stagger: tiles rise in one after another when they mount. */
function StaggerSpecimen() {
  const [round, setRound] = useState(0);
  return (
    <div className={styles.stackWide}>
      <Button
        size="sm"
        variant="secondary"
        leadingIcon={<RotateCcw />}
        onClick={() => setRound((r) => r + 1)}
      >
        Replay
      </Button>
      <Stagger key={round} className={styles.cardGrid}>
        {["Ella", "Leo", "Ines", "Maya", "Noah", "Sofia"].map((name) => (
          <li key={name} style={{ listStyle: "none" }}>
            <Card>
              <Text weight="semibold">{name}</Text>
            </Card>
          </li>
        ))}
      </Stagger>
    </div>
  );
}

export function Showcase() {
  const [mode, setMode] = useState<"people" | "rooms">("people");
  const [looking, setLooking] = useState<"find-room" | "have-room">(
    "find-room",
  );
  const [habits, setHabits] = useState<string[]>(["Early riser"]);
  const toggleHabit = (habit: string) =>
    setHabits((current) =>
      current.includes(habit)
        ? current.filter((h) => h !== habit)
        : [...current, habit],
    );
  const [lang, setLang] = useState<LangId>("card");
  const [palette, setPalette] = useState<string | undefined>(undefined);
  const [detailTab, setDetailTab] = useState<"home" | "person" | "fit">("home");

  // ?lang=collage&palette=night opens a language directly.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const l = q.get("lang");
    if (l && directions.some((d) => d.id === l)) setLang(l as DirectionId);
    if (q.get("palette")) setPalette(q.get("palette") ?? undefined);
  }, []);
  const choose = (next: LangId, nextPalette?: string) => {
    setLang(next);
    setPalette(nextPalette);
    const q = new URLSearchParams();
    if (next !== "base") q.set("lang", next);
    if (nextPalette) q.set("palette", nextPalette);
    history.replaceState(
      null,
      "",
      `${window.location.pathname}${q.size ? `?${q}` : ""}${window.location.hash}`,
    );
  };
  const direction = directions.find((d) => d.id === lang);
  const Screen = lang === "base" ? null : screens[lang];
  const scope = `${lang}-${palette ?? ""}`;

  return (
    <div
      className={`${styles.page} ${directionFontVariables}`}
      data-direction={lang === "base" ? undefined : lang}
      data-palette={palette ?? direction?.palettes?.[0].id}
    >
      <aside className={styles.nav}>
        <Stack gap={1}>
          <Text weight="semibold">RoomPair</Text>
          <Text size="sm" tone="muted">
            Design system
          </Text>
        </Stack>
        <div
          className={styles.langs}
          role="radiogroup"
          aria-label="Design language"
        >
          {(
            [{ id: "base", name: "Base tokens" }, ...directions] as {
              id: LangId;
              name: string;
            }[]
          ).map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={lang === d.id}
              className={styles.lang}
              onClick={() => choose(d.id)}
            >
              {d.name}
            </button>
          ))}
        </div>
        {direction?.palettes && (
          <div className={styles.langs} role="radiogroup" aria-label="Palette">
            {direction.palettes.map((pal, i) => {
              const current =
                (palette ?? direction.palettes?.[0].id) === pal.id;
              return (
                <button
                  key={pal.id}
                  type="button"
                  role="radio"
                  aria-checked={current}
                  className={styles.lang}
                  onClick={() =>
                    choose(direction.id, i === 0 ? undefined : pal.id)
                  }
                >
                  {pal.name}
                </button>
              );
            })}
          </div>
        )}
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
          <Eyebrow>
            {direction
              ? `Design language · ${direction.name}`
              : "Design system · base tokens"}
          </Eyebrow>
          <Heading level={1} size="4xl">
            {direction ? direction.idea : "One system, six languages."}
          </Heading>
          <Text size="lg" tone="muted" className={styles.lead}>
            {direction
              ? "Every token and component below is rendered in this language. The core components are the same code in all six; the language's theme tokens give them their character."
              : "Tokens and components every screen is built from. Pick a design language on the left to see the whole library in it."}
          </Text>
          {direction && (
            <dl className={styles.principles}>
              {direction.principles.map((pr) => (
                <div key={pr.label}>
                  <dt>{pr.label}</dt>
                  <dd>{pr.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        <Section
          id="colors"
          title="Color"
          intro="Screens use semantic tokens. The base ramps feed the default theme; each language sets its own values."
        >
          <div className={styles.colorGroups}>
            {colorGroups.map((group) => (
              <Stack key={group.title} gap={3}>
                <Eyebrow>{group.title}</Eyebrow>
                {group.tokens.map((token) => (
                  <Swatch key={token} token={token} scope={scope} />
                ))}
              </Stack>
            ))}
          </div>
          {lang === "base" && (
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
          )}
        </Section>

        <Section
          id="type"
          title="Typography"
          intro={
            direction
              ? `${direction.principles.find((pr) => pr.label === "Tipografi")?.value ?? ""} Eight sizes; 12px is the floor.`
              : "Manrope for headings, DM Sans for everything else. Eight sizes; 12px is the floor."
          }
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
                alive. <TextLink href="#typography">A link in text.</TextLink>
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
          id="motion"
          title="Motion"
          intro="Shared motion primitives from components/Motion. Durations, easing and distances are tokens; under reduced motion they are 0. Pages move with a relative offset, never a transform, so fixed and sticky parts stay put."
        >
          <Specimen label="Tokens">
            <div className={styles.cardGrid}>
              {motionTokens.map((token) => (
                <TokenValue key={token} token={token} />
              ))}
            </div>
          </Specimen>
          <Specimen label="PageTransition · push / pop / fade (also tab panels)">
            <PageTransitionSpecimen />
          </Specimen>
          <Specimen label="Stagger · tiles and rows">
            <StaggerSpecimen />
          </Specimen>
          <Specimen label="Press · --control-press with --transition-press">
            <Button>Press me</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <IconButton label="Like" icon={<Heart />} variant="solid" />
          </Specimen>
        </Section>

        <Section
          id="icons"
          title="Icons · Card set"
          intro={`${Icons.iconList.length} icons drawn for RoomPair on a 24 grid: round caps, soft corners, a heavier stroke (--icon-stroke) and small solid dots as accents. The app uses them everywhere; names match the lucide icons they replaced. Import from @/design-system/icons.`}
        >
          <Specimen label="Every icon · 16 / 24 / 32">
            <ul className={styles.iconGrid}>
              {Icons.iconList.map(([name, Glyph]) => (
                <li key={name} className={styles.iconTile}>
                  <span className={styles.iconSizes}>
                    <Glyph className={styles.iconSm} />
                    <Glyph className={styles.iconLg} />
                    <Glyph className={styles.iconXl} />
                  </span>
                  <code>{name}</code>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="In context · IconButton, Button, Chip">
            <IconButton label="More options" icon={<Icons.MoreHorizontal />} />
            <IconButton
              label="Undo"
              icon={<Icons.RotateCcw />}
              variant="outline"
            />
            <IconButton
              label="Pass"
              icon={<Icons.X />}
              variant="outline"
              size="lg"
            />
            <IconButton
              label="Like"
              icon={<Icons.Heart />}
              variant="solid"
              size="lg"
            />
            <IconButton
              label="Save"
              icon={<Icons.Bookmark />}
              variant="outline"
              size="sm"
            />
            <Button leadingIcon={<Icons.Send />}>Send</Button>
            <Button variant="secondary" trailingIcon={<Icons.ArrowRight />}>
              Next
            </Button>
            <Chip icon={<Icons.Leaf />}>Plant parent</Chip>
            <Chip icon={<Icons.PawPrint />}>Pets welcome</Chip>
            <Badge tone="success" dot>
              Has a room
            </Badge>
          </Specimen>
          <Specimen label="In context · ListRow and inline text">
            <ListGroup title="Your place" id="spec-icons-place">
              <ListRow
                icon={<Icons.Home />}
                label="Room type"
                value="Private room"
                onClick={() => {}}
              />
              <ListRow
                icon={<Icons.Wallet />}
                label="Rent"
                value="€420 / month"
                onClick={() => {}}
              />
              <ListRow
                icon={<Icons.CalendarDays />}
                label="Move-in"
                onClick={() => {}}
              />
            </ListGroup>
            <Text size="sm" tone="muted">
              <Icons.MapPin className={styles.inlineIcon} /> Āgenskalns, Riga ·{" "}
              <Icons.BadgeCheck
                className={styles.inlineIcon}
                aria-label="Verified"
              />{" "}
              verified · <Icons.Moon className={styles.inlineIcon} /> night owl
            </Text>
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
          <Specimen label="ListRow / ListGroup">
            <ListGroup title="About you" id="spec-about">
              <ListRow
                icon={<Users />}
                label="Work or studies"
                value="Design student"
                onClick={() => {}}
              />
              <ListRow icon={<Building2 />} label="Area" onClick={() => {}} />
            </ListGroup>
          </Specimen>
          <Specimen label="TopBar · tab page">
            <div className={styles.pageFrame}>
              <TopBar
                title="Profile"
                actions={
                  <>
                    <IconButton
                      variant="outline"
                      label="Settings"
                      icon={<Settings />}
                    />
                    <IconButton
                      variant="outline"
                      label="Edit profile"
                      icon={<UserPen />}
                    />
                  </>
                }
              />
            </div>
          </Specimen>
          <Specimen label="Card · MatchScreen (full-screen “Team up!”, replays on load)">
            <div className={styles.matchFrame}>
              <MatchScreen
                you={{ name: "Alex", photo: "/images/alex-1.jpg" }}
                them={{ name: "Ella", age: 23, photo: "/images/ella-1.jpg" }}
                fit={96}
                place={{ price: 420, area: "Āgenskalns" }}
                starters={["👋 Hi!", "When could I see the room?"]}
                onSend={() => {}}
                onClose={() => {}}
              />
            </div>
          </Specimen>
          <Specimen label="Card · DeckEnd (where the swipe card was, once the deck is empty)">
            <DeckEnd
              title="That's everyone for now"
              body="11 people in Riga fit your filters."
              faces={[
                "/images/marta-1.jpg",
                "/images/kenji-1.jpg",
                "/images/tomas-1.jpg",
              ]}
              stats={["3 liked", "6 skipped"]}
              onUndo={() => {}}
            >
              <Button fullWidth>Go through them again</Button>
              <Button variant="secondary" fullWidth>
                Change filters
              </Button>
            </DeckEnd>
          </Specimen>
          <Specimen label="EmptyState · with a checklist (profile gate)">
            <EmptyState
              icon={<UserPen />}
              title="Finish your profile to start"
              body="People only see you, and you can only team up, once these are done:"
              action={{ label: "Complete my profile", onClick: () => {} }}
            >
              <ul>
                <li>Add a photo of yourself</li>
                <li>Add your name, age and school or work</li>
              </ul>
            </EmptyState>
          </Specimen>
          <Specimen label="Progress · default and compact">
            <Progress label="Profile complete" text="20% complete" value={20} />
            <Progress
              compact
              label="Profile complete"
              text="20% complete"
              value={20}
            />
          </Specimen>
          <Specimen label="TopBar · sub-page template (back, title)">
            <div className={styles.pageFrame}>
              <TopBar title="Edit profile" onBack={() => {}} />
              <div className={styles.pageBody}>
                <ListGroup title="Living together" id="spec-sub">
                  <ListRow
                    icon={<Users />}
                    label="Social energy"
                    value="Often"
                    onClick={() => {}}
                  />
                  <ListRow
                    icon={<Building2 />}
                    label="Move-in"
                    value="1 Feb 2027"
                    onClick={() => {}}
                  />
                </ListGroup>
              </div>
            </div>
          </Specimen>
          <Specimen label="ChoiceCards">
            <ChoiceCards
              label="What are you looking for?"
              value={looking}
              onChange={setLooking}
              columns={2}
              options={[
                {
                  value: "find-room",
                  title: "I’m looking for a room",
                  hint: "See people who have a room, room first",
                  icon: <Building2 />,
                },
                {
                  value: "have-room",
                  title: "I have a room, I need a flatmate",
                  hint: "See only people looking for a room",
                  icon: <Users />,
                },
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
            <Avatar name="Ella Berzina" src="/images/ella-1.jpg" size="sm" />
            <Avatar name="Ella Berzina" src="/images/ella-1.jpg" />
            <Avatar name="Alex Kaya" size="lg" />
            <Avatar name="Noah" src="/images/noah-1.jpg" size="xl" />
            <AvatarGroup>
              <Avatar name="Leo" src="/images/leo-1.jpg" size="sm" />
              <Avatar name="Maya" src="/images/maya-1.jpg" size="sm" />
              <Avatar name="Felix" src="/images/felix-1.jpg" size="sm" />
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
          id="details"
          title="Detail blocks"
          intro="Core components for a profile's three groups: Home, Person, Fit. Same code in every language."
        >
          <Specimen label="SectionHeader">
            <div className={styles.stackWide}>
              <SectionHeader
                group="home"
                icon={<Home />}
                title={sampleHome.heading}
              />
              <SectionHeader
                group="person"
                icon={<UserRound />}
                title={samplePerson.heading}
                summary={samplePerson.summary}
              />
              <SectionHeader
                group="fit"
                icon={<Handshake />}
                title="How you fit"
                summary={sampleFit.summary}
              />
            </div>
          </Specimen>
          <Specimen label="FactGrid — tiles / rows">
            <div className={styles.twoUp}>
              <FactGrid facts={sampleHome.facts} />
              <FactGrid facts={sampleHome.facts} variant="rows" />
            </div>
          </Specimen>
          <Specimen label="CompareTable">
            <div className={styles.stackWide}>
              <CompareTable rows={samplePerson.habits} name={sample.name} />
            </div>
          </Specimen>
          <Specimen label="ReasonList + ScoreBars">
            <div className={styles.twoUp}>
              <ReasonList
                reasons={sampleFit.reasons}
                discuss={["Guests on weeknights"]}
              />
              <ScoreBars items={sampleFit.breakdown} />
            </div>
          </Specimen>
          <Specimen label="Tabs">
            <div className={styles.stackWide}>
              <Tabs
                label="Profile sections"
                idPrefix="demo-tab"
                controls="demo-panel"
                value={detailTab}
                onChange={setDetailTab}
                items={[
                  {
                    id: "home",
                    label: (
                      <>
                        <Home /> Room
                      </>
                    ),
                  },
                  {
                    id: "person",
                    label: (
                      <>
                        <UserRound /> {sample.name}
                      </>
                    ),
                  },
                  {
                    id: "fit",
                    label: (
                      <>
                        <Handshake /> Fit {sampleFit.score}%
                      </>
                    ),
                  },
                ]}
              />
              <div
                role="tabpanel"
                id="demo-panel"
                aria-labelledby={`demo-tab-${detailTab}`}
                className={styles.demoPanel}
              >
                {detailTab === "home" && <FactGrid facts={sampleHome.facts} />}
                {detailTab === "person" && <Text>{samplePerson.bio}</Text>}
                {detailTab === "fit" && (
                  <ReasonList reasons={sampleFit.reasons} />
                )}
              </div>
            </div>
          </Specimen>
        </Section>

        <Section
          id="signature"
          title="Signature components"
          intro={
            direction
              ? `What ${direction.name} adds on top of the core. Import them from @/design-system/languages/${direction.id}.`
              : "Each language adds its own components on top of the core. Pick a language to see them."
          }
        >
          {direction ? (
            <table className={styles.sigTable}>
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  <th scope="col">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {signatures[direction.id].map((c) => (
                  <tr key={c.name}>
                    <th scope="row">
                      <code>{c.name}</code>
                    </th>
                    <td>{c.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.langGrid}>
              {directions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={styles.langCard}
                  onClick={() => choose(d.id)}
                >
                  <strong>{d.name}</strong>
                  <span>{d.idea}</span>
                  <small>
                    {signatures[d.id].map((c) => c.name).join(" · ")}
                  </small>
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section
          id="screens"
          title="Discover screen"
          intro="The language's screen in both detail layouts. Drag the card or use the buttons; scroll inside the phone for the details."
        >
          {Screen ? (
            <div className={styles.phones}>
              <figure className={styles.phoneFigure}>
                <figcaption>1 · Blocks</figcaption>
                <div className={styles.phone}>
                  <Screen key={`${scope}-blocks`} layout="blocks" />
                </div>
              </figure>
              <figure className={styles.phoneFigure}>
                <figcaption>2 · Tabs</figcaption>
                <div className={styles.phone}>
                  <Screen key={`${scope}-tabs`} layout="tabs" />
                </div>
              </figure>
            </div>
          ) : (
            <Text tone="muted">
              Pick a design language on the left to see its Discover screen.
            </Text>
          )}
        </Section>

        <Section
          id="pattern"
          title="Composition"
          intro="A profile summary built only from primitives above — no new CSS. Screens should look like this in code."
        >
          <Card variant="raised" padding="none" className={styles.profileCard}>
            <img
              src="/images/ella-1.jpg"
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
