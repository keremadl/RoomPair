"use client";
import { Bookmark, BookmarkCheck, MapPin } from "@/design-system/icons";
import { Avatar, Badge, Button, Dialog, FactGrid, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import type { Profile, Room } from "@/lib/types";
import d from "./dialogs.module.css";

export function RoomDialog({
  room,
  host,
  saved,
  onClose,
  onToggle,
  onHost,
}: {
  room: Room;
  host?: Profile;
  saved: boolean;
  onClose: () => void;
  onToggle: () => void;
  onHost: (p: Profile) => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog title={room.title} onClose={onClose} size="lg">
      <img src={room.photo} alt="" className={d.roomPhoto} />
      <Text tone="muted" className={d.spaced}>
        <MapPin aria-hidden="true" className={d.inlineIcon} />{" "}
        {room.neighborhood}, Riga
      </Text>
      <FactGrid
        className={d.spaced}
        facts={[
          {
            label: t("Rent"),
            value: `€${room.price}`,
            note: `/ ${t("month")}`,
          },
          { label: t("discover.neighborhood"), value: room.neighborhood },
        ]}
      />
      <Text className={d.spaced}>{room.description}</Text>
      <div className={d.tags}>
        {room.tags.map((tag) => (
          <Badge key={tag}>{t(tag)}</Badge>
        ))}
      </div>
      {host && (
        <button type="button" className={d.host} onClick={() => onHost(host)}>
          <Avatar name={host.name} src={host.photo} />
          <span>
            <strong>{host.name}</strong>
            <small>
              {host.occupation} · {t("discover.viewProfile")}
            </small>
          </span>
        </button>
      )}
      <Text size="xs" tone="muted" className={d.spaced}>
        {t("Demo listing: the room and its owner are not verified.")}
      </Text>
      <div className={d.footer}>
        <Button
          variant={saved ? "secondary" : "primary"}
          leadingIcon={saved ? <BookmarkCheck /> : <Bookmark />}
          onClick={onToggle}
          aria-pressed={saved}
          fullWidth
        >
          {saved ? t("Saved") : t("Save room")}
        </Button>
      </div>
    </Dialog>
  );
}
