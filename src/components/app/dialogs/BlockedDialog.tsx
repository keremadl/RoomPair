"use client";
import { Avatar, Button, Dialog, Text } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import d from "./dialogs.module.css";

export type BlockedPerson = {
  id: string;
  name: string;
  photo?: string;
};

/** The people you blocked, each with a way to let them back in. */
export function BlockedDialog({
  people,
  onUnblock,
  onClose,
}: {
  people: BlockedPerson[];
  onUnblock: (person: BlockedPerson) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog title={t("Blocked people")} onClose={onClose}>
      <Text tone="muted" className={d.lead}>
        {people.length
          ? t(
              "They cannot see you and you do not see them. Unblocking does not bring back the chat.",
            )
          : t("You have not blocked anyone.")}
      </Text>
      <ul className={d.people}>
        {people.map((person) => (
          <li key={person.id}>
            <Avatar name={person.name} src={person.photo} />
            <Text>{person.name}</Text>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUnblock(person)}
            >
              {t("Unblock")}
            </Button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
