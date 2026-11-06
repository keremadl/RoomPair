"use client";
import { Heart } from "@/design-system/icons";
import { EmptyState, Stagger } from "@/design-system";
import { getCompatibility } from "@/lib/matching";
import { useI18n } from "@/lib/i18n";
import type { Preferences, Profile } from "@/lib/types";
import v from "./views.module.css";

/**
 * Likes: people who liked you and are waiting for your answer, as a
 * two-column grid of photo tiles. Room seekers see the room first, with the
 * host's face on it. A tile opens the person as a sub-page (card, details,
 * Skip / Team up). People you liked are not listed: a match shows up in
 * Messages.
 */
export function LikesView({
  received,
  preferences,
  onOpen,
  onDiscover,
}: {
  received: Profile[];
  preferences: Preferences;
  /** Opens the person as a sub-page. */
  onOpen: (p: Profile) => void;
  onDiscover: () => void;
}) {
  const { t } = useI18n();
  const seeker = preferences.intent !== "have-room";
  const people = received
    .map((p) => ({ p, fit: getCompatibility(p, preferences).score }))
    .sort((a, b) => b.fit - a.fit);
  if (people.length === 0)
    return (
      <EmptyState
        icon={<Heart />}
        title={t("No likes yet")}
        body={t("When someone likes you, they appear here.")}
        action={{ label: t("Go to Discover"), onClick: onDiscover }}
      />
    );
  return (
    <section className={v.likes} aria-labelledby="liked-you">
      <h2 className={v.matchesTitle} id="liked-you">
        {t("likes.received")} · {people.length}
      </h2>
      <Stagger className={v.likeGrid}>
        {people.map(({ p, fit }) => {
          const room = seeker && p.intent === "have-room" ? p.room : undefined;
          return (
            <li key={p.id}>
              <button
                type="button"
                className={v.likeTile}
                aria-label={[
                  `${p.name}, ${p.age}`,
                  room?.title,
                  `${fit}% ${t("fit")}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                onClick={() => onOpen(p)}
              >
                <img src={room?.photo ?? p.photo} alt="" />
                <span className={v.likeFit}>{fit}%</span>
                {room && <img className={v.likeFace} src={p.photo} alt="" />}
                <span className={v.likeName}>
                  {room ? (
                    <>
                      €{room.price}
                      <small>
                        {p.name}, {p.age} · {p.neighborhood}
                      </small>
                    </>
                  ) : (
                    <>
                      {p.name}, {p.age}
                      <small>{p.occupation}</small>
                    </>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </Stagger>
    </section>
  );
}
