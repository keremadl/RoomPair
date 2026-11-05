"use client";
import { Heart, MessageCircle } from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  Button,
  Dialog,
  Eyebrow,
  Text,
} from "@/design-system";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import d from "./dialogs.module.css";

export function MatchDialog({
  profile: p,
  userName,
  onClose,
  onChat,
}: {
  profile: Profile;
  userName: string;
  onClose: () => void;
  onChat: () => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog title={t("It’s a RoomPair!")} onClose={onClose}>
      <div className={d.match}>
        <AvatarGroup>
          <Avatar name={userName} size="xl" />
          <Avatar name={p.name} src={p.photo} size="xl" />
        </AvatarGroup>
        <Eyebrow>
          <Heart aria-hidden="true" className={d.inlineIcon} />{" "}
          {t("GOOD FEELING. MUTUAL FEELING.")}
        </Eyebrow>
        <Text size="lg">
          {t("You and")} {p.name} {t("both see a little home in each other.")}
        </Text>
        <div className={d.actions}>
          <Button
            size="lg"
            leadingIcon={<MessageCircle />}
            onClick={onChat}
            fullWidth
          >
            {t("Say a little hello")}
          </Button>
          <Button variant="ghost" onClick={onClose} fullWidth>
            {t("Keep exploring")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
