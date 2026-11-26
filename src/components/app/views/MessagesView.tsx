"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  CheckCheck,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
} from "@/design-system/icons";
import {
  Avatar,
  Button,
  EmptyState,
  IconButton,
  Stagger,
  VisuallyHidden,
} from "@/design-system";
import { dayLabel, localDay } from "@/lib/chat-time";
import { getCompatibility } from "@/lib/matching";
import { useI18n } from "@/lib/i18n";
import type { Conversation, Preferences, Profile } from "@/lib/types";
import { readPhoto } from "../profile/photos";
import v from "./views.module.css";

const starters = [
  "What’s your ideal Sunday at home?",
  "How do you feel about a shared cleaning routine?",
  "Want to grab a coffee and talk about the room?",
];

/** Show the search box only when there is something to search. */
const SEARCH_FROM = 6;

/**
 * Messages: new matches as tall tiles at the top (people, or their room when
 * you are looking for one), then conversations that have started.
 */
export function MessagesView({
  chats,
  activeId,
  showChat,
  typing,
  preferences,
  profileById,
  onSelect,
  onSend,
  onError,
  onOpenProfile,
  onOptions,
  onDiscover,
}: {
  chats: Conversation[];
  activeId: string | null;
  /** Phones: show the open conversation instead of the list. */
  showChat: boolean;
  typing: string | null;
  preferences: Preferences;
  profileById: (id: string) => Profile;
  onSelect: (id: string) => void;
  onSend: (text: string, photo?: string) => void;
  /** Shown when a picked file is not an image. */
  onError?: (message: string) => void;
  onOpenProfile: (p: Profile) => void;
  onOptions: (p: Profile) => void;
  onDiscover: () => void;
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const chat = chats.find((c) => c.id === activeId) ?? chats[0];
  const person = chat ? profileById(chat.profileId) : null;
  const fresh = chats.filter((c) => c.messages.length === 0);
  const started = chats.filter((c) => c.messages.length > 0);
  const open = (id: string) => onSelect(id);
  // A draft belongs to one conversation: don't carry it into the next.
  const [draftChatId, setDraftChatId] = useState(chat?.id);
  if (draftChatId !== chat?.id) {
    setDraftChatId(chat?.id);
    setMessage("");
  }
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chat?.messages.length, typing]);

  const send = (text = message) => {
    if (!text.trim()) return;
    onSend(text);
    setMessage("");
  };

  if (!chat || !person)
    return (
      <>
        <EmptyState
          icon={<MessageCircle />}
          title={t("No conversations yet")}
          body={t(
            "A conversation opens when you and someone else both press Team up.",
          )}
          action={{ label: t("Go to Discover"), onClick: onDiscover }}
        />
      </>
    );

  const host = person.intent === "have-room";
  return (
    <>
      <div className={v.messenger} data-show={showChat ? "chat" : "list"}>
        <aside className={v.chatList} aria-label={t("Conversations")}>
          {fresh.length > 0 && (
            <section className={v.matches} aria-labelledby="new-matches">
              <h2 className={v.matchesTitle} id="new-matches">
                {t("New matches")} · {fresh.length}
              </h2>
              <Stagger className={v.matchRow}>
                {fresh.map((c) => {
                  const p = profileById(c.profileId);
                  // Room seekers match with hosts: show the room, with the face on it.
                  const room =
                    p.intent === "have-room" &&
                    preferences.intent !== "have-room"
                      ? p.room
                      : undefined;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={v.matchTile}
                        aria-current={c.id === chat.id ? "true" : undefined}
                        aria-label={
                          room
                            ? `${p.name} · ${room.title}`
                            : `${p.name}, ${p.age}`
                        }
                        onClick={() => open(c.id)}
                      >
                        <img src={room?.photo ?? p.photo} alt="" />
                        {room && (
                          <img className={v.matchFace} src={p.photo} alt="" />
                        )}
                        <span className={v.matchName}>
                          {room ? `€${room.price}` : p.name}
                          <small>{room ? p.name : `${p.age}`}</small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </Stagger>
            </section>
          )}
          {started.length > 0 && fresh.length > 0 && (
            <h2 className={v.matchesTitle}>{t("Conversations")}</h2>
          )}
          {started.length >= SEARCH_FROM && (
            <label className={v.chatSearch}>
              <Search aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search conversations")}
                aria-label={t("Search conversations")}
              />
            </label>
          )}
          {started.length === 0 && (
            <p className={v.noChats}>
              {t("Say hi to a match to start a conversation.")}
            </p>
          )}
          <Stagger className={v.conversations}>
            {started
              .filter((c) =>
                profileById(c.profileId)
                  ?.name.toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((c) => {
                const p = profileById(c.profileId);
                const last = c.messages.at(-1);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={v.conversation}
                      aria-current={c.id === chat.id ? "true" : undefined}
                      onClick={() => open(c.id)}
                    >
                      <Avatar name={p.name} src={p.photo} />
                      <span className={v.conversationText}>
                        <strong>
                          {p.name}
                          <small>
                            {!last
                              ? t("New")
                              : last.day && last.day !== localDay()
                                ? dayLabel(last.day, t)
                                : last.time}
                          </small>
                        </strong>
                        <span>
                          {last
                            ? last.text || t("Photo")
                            : t("New match, no messages yet")}
                        </span>
                      </span>
                      {c.unread > 0 && (
                        <span className={v.unread}>
                          {c.unread}
                          <VisuallyHidden> {t("unread")}</VisuallyHidden>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
          </Stagger>
        </aside>

        <section className={v.chat} aria-label={person.name}>
          {/* Wide screens only; on phones the top bar holds the same things. */}
          <header className={v.chatHeader}>
            <button
              type="button"
              className={v.chatPerson}
              onClick={() => onOpenProfile(person)}
              aria-label={`${t("discover.viewProfile")}: ${person.name}`}
            >
              <Avatar name={person.name} src={person.photo} />
              <span>
                <strong>
                  {person.name}, {person.age}
                  {person.verified && (
                    <BadgeCheck aria-label={t("discover.verified")} />
                  )}
                </strong>
                <small>
                  <span className={v.fitChip}>
                    {getCompatibility(person, preferences).score}% {t("fit")}
                  </span>
                  {host ? t("Host") : t("Explorer")} · {person.neighborhood}
                </small>
              </span>
            </button>
            <IconButton
              variant="outline"
              label={t("Conversation options")}
              icon={<MoreHorizontal />}
              onClick={() => onOptions(person)}
            />
          </header>
          <div className={v.stream} aria-live="polite">
            {chat.messages.length === 0 && (
              <div className={v.starter}>
                <p>{t("Start with a question about everyday life:")}</p>
                {starters.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="secondary"
                    size="sm"
                    onClick={() => send(t(prompt))}
                  >
                    {t(prompt)}
                  </Button>
                ))}
              </div>
            )}
            {chat.messages.map((m, i) => {
              const before = chat.messages[i - 1];
              const after = chat.messages[i + 1];
              // A new day gets a line; the time closes a run of messages
              // from one person, rather than sitting on every bubble.
              const newDay = Boolean(m.day) && m.day !== before?.day;
              const closes =
                !after || after.sender !== m.sender || after.day !== m.day;
              return (
                <Fragment key={m.id}>
                  {newDay && m.day && (
                    <p className={v.day}>
                      <span>{dayLabel(m.day, t)}</span>
                    </p>
                  )}
                  <div
                    className={v.messageRow}
                    data-mine={m.sender === "me"}
                    data-closes={closes ? "" : undefined}
                  >
                    <div
                      className={v.bubble}
                      data-photo={m.photo ? "" : undefined}
                    >
                      {m.photo && (
                        <img
                          className={v.bubblePhoto}
                          src={m.photo}
                          alt={t("Photo")}
                        />
                      )}
                      {m.text && <p>{m.text}</p>}
                    </div>
                    {closes && (
                      <small className={v.sent}>
                        {m.time}
                        {m.sender === "me" && (
                          <CheckCheck aria-label={t("Sent")} />
                        )}
                      </small>
                    )}
                  </div>
                </Fragment>
              );
            })}
            {typing === chat.id && (
              <div className={v.typing} aria-label={t("messages.typing")}>
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={end} />
          </div>
          <form
            className={v.composer}
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <div className={v.composerBar}>
              <IconButton
                size="sm"
                label={t("Send a photo")}
                icon={<ImagePlus />}
                onClick={() => picker.current?.click()}
              />
              <input
                className={v.composerInput}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("Write a message")}
                aria-label={t("Write a message")}
                maxLength={2000}
              />
            </div>
            {/* Send stands apart: a round button to the right of the bar. */}
            <IconButton
              type="submit"
              variant="solid"
              size="md"
              label={t("messages.send")}
              icon={<Send />}
              disabled={!message.trim()}
            />
            <input
              ref={picker}
              type="file"
              accept="image/*"
              hidden
              aria-label={t("Send a photo")}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  onSend(message, await readPhoto(file));
                  setMessage("");
                } catch {
                  onError?.(t("That file is not a photo."));
                }
              }}
            />
          </form>
        </section>
      </div>
    </>
  );
}
