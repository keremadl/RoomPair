"use client";
import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import {
  BadgeCheck,
  Bell,
  Building2,
  Check,
  ChevronDown,
  Compass,
  Heart,
  Home,
  Info,
  MessageCircle,
  RotateCcw,
  Smile,
  Users,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Chip,
  Heading,
  IconButton,
  SegmentedControl,
  Stack,
  Text,
} from "@/design-system";
import { defaultPreferences, profiles } from "@/lib/data";
import { rankProfiles } from "@/lib/matching";
import type { MatchResult, Profile } from "@/lib/types";
import styles from "./swipe-screen.module.css";

type Decision = "like" | "pass";
const ranked = rankProfiles(profiles, {
  ...defaultPreferences,
  intent: "either",
});

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** The Discover (swipe) screen, built only from design-system components and tokens. */
export function SwipeScreen() {
  const [mode, setMode] = useState<"people" | "rooms">("people");
  const [position, setPosition] = useState(0);
  const [history, setHistory] = useState<Decision[]>([]);
  const [exitDirection, setExitDirection] = useState(1);

  const deck = useMemo(
    () =>
      ranked.filter(({ profile }) =>
        mode === "rooms" ? profile.intent === "have-room" : true,
      ),
    [mode],
  );
  const current = deck[position % deck.length];

  const decide = (decision: Decision) => {
    setExitDirection(decision === "like" ? 1 : -1);
    setHistory((h) => [...h, decision]);
    setPosition((p) => p + 1);
  };
  const undo = () => {
    if (!history.length) return;
    setExitDirection(-1);
    setHistory((h) => h.slice(0, -1));
    setPosition((p) => p - 1);
  };

  return (
    <div className={styles.screen}>
      <header className={styles.topbar}>
        <span className={styles.wordmark}>
          roompair<span className={styles.wordmarkDot}>.</span>
        </span>
        <Stack direction="row" gap={1} align="center">
          <Button variant="ghost" size="sm" trailingIcon={<ChevronDown />}>
            Riga
          </Button>
          <IconButton label="Notifications" icon={<Bell />} />
        </Stack>
      </header>

      <div className={styles.scroll}>
        <SegmentedControl
          label="Search mode"
          fullWidth
          value={mode}
          onChange={(value) => {
            setMode(value);
            setPosition(0);
            setHistory([]);
          }}
          options={[
            { value: "people", label: "Find people", icon: <Users /> },
            { value: "rooms", label: "Find a room", icon: <Building2 /> },
          ]}
        />

        <div className={styles.deck}>
          <div className={styles.nextCard} aria-hidden="true" />
          <AnimatePresence initial={false} custom={exitDirection}>
            <ProfileCard
              key={`${mode}-${position}`}
              profile={current.profile}
              onDecision={decide}
            />
          </AnimatePresence>
        </div>

        <div className={styles.actions}>
          <IconButton
            label="Undo"
            icon={<RotateCcw />}
            variant="outline"
            disabled={!history.length}
            onClick={undo}
          />
          <IconButton
            label="Pass"
            icon={<X />}
            variant="outline"
            size="lg"
            onClick={() => decide("pass")}
          />
          <IconButton
            label="Like"
            icon={<Heart />}
            variant="solid"
            size="lg"
            onClick={() => decide("like")}
          />
          <IconButton
            label="Profile details"
            icon={<Info />}
            variant="outline"
          />
        </div>

        <FitCard match={current.match} name={current.profile.name} />
      </div>

      <nav className={styles.tabbar} aria-label="Main">
        {[
          { label: "Discover", icon: Compass, active: true },
          { label: "Likes", icon: Heart, count: 5 },
          { label: "Messages", icon: MessageCircle, count: 1 },
          { label: "My space", icon: Home },
          { label: "Profile", icon: Smile },
        ].map(({ label, icon: Icon, active, count }) => (
          <button
            key={label}
            type="button"
            className={styles.tab}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.tabIcon}>
              <Icon />
              {count ? (
                <Badge tone="primary" className={styles.tabCount}>
                  {count}
                </Badge>
              ) : null}
            </span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProfileCard({
  profile,
  onDecision,
}: {
  profile: Profile;
  onDecision: (d: Decision) => void;
}) {
  const [photo, setPhoto] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -20], [1, 0]);
  const photos = profile.photos.length ? profile.photos : [profile.photo];
  const price = profile.room?.price;

  return (
    <motion.article
      className={styles.card}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 || info.velocity.x > 650) onDecision("like");
        else if (info.offset.x < -100 || info.velocity.x < -650)
          onDecision("pass");
      }}
      variants={{
        exit: (direction: number) => ({
          x: direction * 520,
          rotate: direction * 16,
          opacity: 0,
          transition: { duration: 0.28, ease: "easeIn" },
        }),
      }}
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit="exit"
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      <img
        className={styles.photo}
        src={photos[photo]}
        alt={`${profile.name}, photo ${photo + 1}`}
        draggable={false}
      />
      <div className={styles.scrim} />

      {photos.length > 1 && (
        <>
          <div className={styles.progress} aria-hidden="true">
            {photos.map((p, i) => (
              <span
                key={p}
                className={i === photo ? styles.progressActive : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.pagePrev}
            aria-label="Previous photo"
            onClick={() => setPhoto((p) => Math.max(0, p - 1))}
          />
          <button
            type="button"
            className={styles.pageNext}
            aria-label="Next photo"
            onClick={() => setPhoto((p) => Math.min(photos.length - 1, p + 1))}
          />
        </>
      )}

      <div className={styles.cardTop}>
        <Badge
          tone={profile.intent === "have-room" ? "success" : "neutral"}
          dot
        >
          {profile.intent === "have-room" ? "Has a room" : "Looking together"}
        </Badge>
      </div>

      <div className={styles.cardInfo}>
        <Stack gap={1}>
          <Stack direction="row" gap={2} align="center">
            <Heading level={2} size="2xl" className={styles.onImage}>
              {profile.name}, {profile.age}
            </Heading>
            {profile.verified && (
              <BadgeCheck
                className={styles.verified}
                aria-label="Student email checked"
              />
            )}
          </Stack>
          <Text size="sm" className={styles.onImageMuted}>
            {profile.occupation} · {profile.neighborhood}
          </Text>
        </Stack>
        <div className={styles.facts}>
          <span>
            <strong>
              {price
                ? `€${price}`
                : `€${profile.budget[0]}–${profile.budget[1]}`}
            </strong>
            {price ? " / month" : " budget"}
          </span>
          <span>
            Moving <strong>{monthYear(profile.moveDate)}</strong>
          </span>
          <span>
            <strong>{profile.stayMonths}</strong> months
          </span>
        </div>
        <Stack direction="row" gap={2} wrap>
          {profile.tags.map((tag) => (
            <Chip key={tag} surface="onImage" tabIndex={-1}>
              {tag}
            </Chip>
          ))}
        </Stack>
      </div>

      <motion.div
        style={{ opacity: likeOpacity }}
        className={`${styles.stamp} ${styles.stampLike}`}
      >
        Roommate?
      </motion.div>
      <motion.div
        style={{ opacity: passOpacity }}
        className={`${styles.stamp} ${styles.stampPass}`}
      >
        Pass
      </motion.div>
    </motion.article>
  );
}

function FitCard({ match, name }: { match: MatchResult; name: string }) {
  return (
    <Card variant="raised" padding="md">
      <Stack gap={4}>
        <Stack direction="row" gap={4} align="center">
          <span className={styles.score}>
            {match.score}
            <span>%</span>
          </span>
          <Stack gap={1}>
            <Text weight="semibold">Everyday fit with {name}</Text>
            <Text size="xs" tone="muted">
              Based on what you both said. Not a promise.
            </Text>
          </Stack>
        </Stack>
        <Stack gap={2}>
          {match.reasons.slice(0, 3).map((reason) => (
            <Stack key={reason} direction="row" gap={2} align="center">
              <Check className={styles.reasonIcon} aria-hidden="true" />
              <Text size="sm">{reason}</Text>
            </Stack>
          ))}
        </Stack>
        <Button variant="secondary" fullWidth>
          See why you fit
        </Button>
      </Stack>
    </Card>
  );
}
