"use client";
import { MessageCircle } from "@/design-system/icons";
import { Avatar, AvatarGroup, Button, Dialog, Text } from "@/design-system";
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
        <Text size="lg">
          {t("You and")} {p.name} {t("both pressed Team up. You can chat now.")}
        </Text>
        <div className={d.actions}>
          <Button
            size="lg"
            leadingIcon={<MessageCircle />}
            onClick={onChat}
            fullWidth
          >
            {t("Send a message")}
          </Button>
          <Button variant="ghost" onClick={onClose} fullWidth>
            {t("Not now")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
