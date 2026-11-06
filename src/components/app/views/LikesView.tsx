"use client";
import { useId, useState } from "react";
import { Check, Heart, MessageCircle } from "@/design-system/icons";
import { Button, EmptyState, Tabs } from "@/design-system";
import { getCompatibility } from "@/lib/matching";
import { useI18n } from "@/lib/i18n";
import type { Preferences, Profile } from "@/lib/types";
import v from "./views.module.css";

type Tab = "received" | "sent";

/**
 * Likes: people who liked you, and people you liked, as a two-column grid of
 * photo tiles. Room seekers see the room first, with the host's face on it.
 * A tile opens the person as a sub-page (card, details, Skip / Team up).
 */
export function LikesView({
  received,
  sent,
  preferences,
  onOpen,
  onDiscover,
}: {
  received: Profile[];
  sent: Profile[];
  preferences: Preferences;
  /** Opens the person as a sub-page. */
  onOpen: (p: Profile) => void;
  onDiscover: () => void;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("received");
  const base = useId();
  const seeker = preferences.intent !== "have-room";
  const people = (tab === "received" ? received : sent)
    .map((p) => ({ p, fit: getCompatibility(p, preferences).score }))
    .sort((a, b) => b.fit - a.fit);
  return (
    <>
      <div className={v.toolbar}>
        <Tabs
          label={t("nav.likes")}
          idPrefix={`${base}-tab`}
          controls={`${base}-panel`}
          value={tab}
          onChange={setTab}
          items={[
            {
              id: "received",
              label: `${t("likes.received")} · ${received.length}`,
            },
            { id: "sent", label: `${t("likes.sent")} · ${sent.length}` },
          ]}
        />
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${tab}`}
      >
        {people.length === 0 ? (
          <EmptyState
            icon={<Heart />}
            title={
              tab === "received"
                ? t("No likes yet")
                : t("You have not liked anyone yet")
            }
            body={
              tab === "received"
                ? t("When someone likes you, they appear here.")
                : t("Press Team up on a card in Discover to like someone.")
            }
            action={{ label: t("Go to Discover"), onClick: onDiscover }}
          />
        ) : (
          <ul className={v.likeGrid}>
            {people.map(({ p, fit }) => {
              const room =
                seeker && p.intent === "have-room" ? p.room : undefined;
              const matched = tab === "sent" && p.likesYou;
              const waiting = tab === "sent" && !p.likesYou;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={v.likeTile}
                    data-waiting={waiting || undefined}
                    aria-label={[
                      `${p.name}, ${p.age}`,
                      room?.title,
                      `${fit}% ${t("fit")}`,
                      matched ? t("Matched") : waiting ? t("Waiting") : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    onClick={() => onOpen(p)}
                  >
                    <img src={room?.photo ?? p.photo} alt="" />
                    <span className={v.likeFit}>{fit}%</span>
                    {(matched || waiting) && (
                      <span className={v.likeState}>
                        {matched ? (
                          <>
                            <MessageCircle aria-hidden="true" /> {t("Matched")}
                          </>
                        ) : (
                          <>
                            <Check aria-hidden="true" /> {t("Waiting")}
                          </>
                        )}
                      </span>
                    )}
                    {room && (
                      <img className={v.likeFace} src={p.photo} alt="" />
                    )}
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
          </ul>
        )}
      </div>
    </>
  );
}

/**
 * Under the card on the Likes sub-page for someone you already liked:
 * a way into the chat if it is mutual, otherwise that you are waiting.
 */
export function LikeNext({
  matched,
  onMessage,
}: {
  matched: boolean;
  onMessage: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className={v.likeNext}>
      {matched ? (
        <Button leadingIcon={<MessageCircle />} onClick={onMessage}>
          {t("Message")}
        </Button>
      ) : (
        <span className={v.waiting}>
          <Check aria-hidden="true" /> {t("Waiting for them")}
        </span>
      )}
    </div>
  );
}
