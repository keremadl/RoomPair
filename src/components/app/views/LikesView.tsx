"use client";
import { useId, useState } from "react";
import { Check, Heart, MessageCircle } from "lucide-react";
import { Button, EmptyState, Tabs } from "@/design-system";
import { getCompatibility } from "@/lib/matching";
import { useI18n } from "@/lib/i18n";
import type { Preferences, Profile } from "@/lib/types";
import { PersonCard } from "../PersonCard";
import v from "./views.module.css";

type Tab = "received" | "sent";

/** People who liked you, and people you liked, as character cards. */
export function LikesView({
  received,
  sent,
  preferences,
  onOpenProfile,
  onLikeBack,
  onSayHello,
  onDiscover,
}: {
  received: Profile[];
  sent: Profile[];
  preferences: Preferences;
  onOpenProfile: (p: Profile) => void;
  onLikeBack: (p: Profile) => void;
  onSayHello: (p: Profile) => void;
  onDiscover: () => void;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("received");
  const base = useId();
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
          <div className={v.cardGrid}>
            {people.map(({ p, fit }) => (
              <PersonCard
                key={p.id}
                profile={p}
                fit={fit}
                onOpen={() => onOpenProfile(p)}
                actions={
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onOpenProfile(p)}
                    >
                      {t("View profile")}
                    </Button>
                    {tab === "received" ? (
                      <Button
                        size="sm"
                        leadingIcon={<Heart />}
                        onClick={() => onLikeBack(p)}
                      >
                        {t("Team up")}
                      </Button>
                    ) : p.likesYou ? (
                      <Button
                        size="sm"
                        leadingIcon={<MessageCircle />}
                        onClick={() => onSayHello(p)}
                      >
                        {t("Message")}
                      </Button>
                    ) : (
                      <span className={v.waiting}>
                        <Check aria-hidden="true" /> {t("Waiting for them")}
                      </span>
                    )}
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
