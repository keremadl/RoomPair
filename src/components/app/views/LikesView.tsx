"use client";
import { useId, useState } from "react";
import { BadgeCheck, Check, Heart, MapPin, MessageCircle } from "lucide-react";
import { Badge, Button, Card, EmptyState, Tabs } from "@/design-system";
import { getCompatibility } from "@/lib/matching";
import { useI18n } from "@/lib/i18n";
import type { Preferences, Profile } from "@/lib/types";
import { PageHeader } from "../PageHeader";
import v from "./views.module.css";

type Tab = "received" | "sent";

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
  const people = tab === "received" ? received : sent;
  return (
    <>
      <PageHeader
        eyebrow={t("A LITTLE MUTUAL FEELING")}
        title={t("likes.title")}
        description={t("likes.subtitle")}
      />
      <Tabs
        label={t("nav.likes")}
        idPrefix={`${base}-tab`}
        controls={`${base}-panel`}
        value={tab}
        onChange={setTab}
        className={v.pageTabs}
        items={[
          {
            id: "received",
            label: `${t("likes.received")} · ${received.length}`,
          },
          { id: "sent", label: `${t("likes.sent")} · ${sent.length}` },
        ]}
      />
      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${tab}`}
      >
        {people.length === 0 ? (
          <EmptyState
            icon={<Heart />}
            title={t("Good connections take a little time.")}
            body={t(
              "Explore your community and send a like to someone you could see yourself living with.",
            )}
            action={{ label: t("Meet your people"), onClick: onDiscover }}
          />
        ) : (
          <div className={v.tileGrid}>
            {people.map((p) => (
              <Card key={p.id} padding="none" className={v.tile}>
                <button
                  type="button"
                  className={v.tilePhoto}
                  onClick={() => onOpenProfile(p)}
                  aria-label={`${t("discover.viewProfile")}: ${p.name}`}
                >
                  <img src={p.photo} alt="" />
                  <Badge tone="success" className={v.tileBadge}>
                    {getCompatibility(p, preferences).score}% {t("fit")}
                  </Badge>
                </button>
                <div className={v.tileBody}>
                  <h3 className={v.tileTitle}>
                    {p.name}, {p.age}
                    {p.verified && (
                      <BadgeCheck
                        aria-label={t("discover.verified")}
                        className={v.verified}
                      />
                    )}
                  </h3>
                  <p className={v.tileText}>{p.occupation}</p>
                  <p className={v.tileMeta}>
                    <MapPin aria-hidden="true" /> {p.neighborhood}
                  </p>
                  <div className={v.tileActions}>
                    {tab === "received" ? (
                      <Button
                        size="sm"
                        leadingIcon={<Heart />}
                        onClick={() => onLikeBack(p)}
                      >
                        {t("Like back")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        leadingIcon={p.likesYou ? <MessageCircle /> : <Check />}
                        onClick={() => onSayHello(p)}
                      >
                        {p.likesYou ? t("Say hello") : t("Like sent")}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
