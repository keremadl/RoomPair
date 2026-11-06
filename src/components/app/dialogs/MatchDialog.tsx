"use client";
import { Dialog } from "@/design-system";
import { MatchScreen } from "@/design-system/languages/card/MatchScreen";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

/** Full-screen "Team up!" after a mutual like, with a first message. */
export function MatchDialog({
  profile: p,
  you,
  fit,
  roomFirst,
  onClose,
  onSend,
}: {
  profile: Profile;
  you: { name: string; photo: string };
  fit: number;
  /** You are looking for a room: show theirs. */
  roomFirst: boolean;
  onClose: () => void;
  /** Opens the chat with this first message. */
  onSend: (text: string) => void;
}) {
  const { t } = useI18n();
  const place = roomFirst && p.room ? p.room : undefined;
  const starters = place
    ? [
        t("👋 Hi!"),
        t("When could I see the room?"),
        t("What are the flatmates like?"),
      ]
    : [
        t("👋 Hi!"),
        t("When are you moving?"),
        t("What's your ideal Sunday at home?"),
      ];
  return (
    <Dialog
      title={t("It’s a RoomPair!")}
      onClose={onClose}
      size="full"
      hideClose
      hideTitle
    >
      <MatchScreen
        you={you}
        them={{ name: p.name, age: p.age, photo: p.photo }}
        fit={fit}
        place={place && { price: place.price, area: p.neighborhood }}
        starters={starters}
        onSend={onSend}
        onClose={onClose}
      />
    </Dialog>
  );
}
