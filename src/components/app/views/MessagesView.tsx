"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCheck,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
} from "lucide-react";
import {
  Avatar,
  Button,
  EmptyState,
  IconButton,
  VisuallyHidden,
} from "@/design-system";
import { getCompatibility } from "@/lib/matching";
import { useI18n } from "@/lib/i18n";
import type { Conversation, Preferences, Profile } from "@/lib/types";
import v from "./views.module.css";

const starters = [
  "What’s your ideal Sunday at home?",
  "How do you feel about a shared cleaning routine?",
  "Want to grab a coffee and talk about the room?",
];

/** Show the search box only when there is something to search. */
const SEARCH_FROM = 6;

export function MessagesView({
  chats,
  activeId,
  typing,
  preferences,
  profileById,
  onSelect,
  onSend,
  onOpenProfile,
  onOptions,
  onDiscover,
}: {
  chats: Conversation[];
  activeId: string | null;
  typing: string | null;
  preferences: Preferences;
  profileById: (id: string) => Profile;
  onSelect: (id: string) => void;
  onSend: (text: string) => void;
  onOpenProfile: (p: Profile) => void;
  onOptions: (p: Profile) => void;
  onDiscover: () => void;
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const chat = chats.find((c) => c.id === activeId) ?? chats[0];
  const person = chat ? profileById(chat.profileId) : null;
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
          {chats.length >= SEARCH_FROM && (
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
          <ul className={v.conversations}>
            {chats
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
                      onClick={() => {
                        onSelect(c.id);
                        setShowChat(true);
                      }}
                    >
                      <Avatar name={p.name} src={p.photo} />
                      <span className={v.conversationText}>
                        <strong>
                          {p.name}
                          <small>{last?.time ?? t("New")}</small>
                        </strong>
                        <span>
                          {last?.text ?? t("New match, no messages yet")}
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
          </ul>
        </aside>

        <section className={v.chat} aria-label={person.name}>
          <header className={v.chatHeader}>
            <IconButton
              className={v.chatBack}
              label={t("Back to conversations")}
              icon={<ArrowLeft />}
              onClick={() => setShowChat(false)}
            />
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
            {chat.messages.map((m) => (
              <div
                key={m.id}
                className={v.messageRow}
                data-mine={m.sender === "me"}
              >
                <div className={v.bubble}>
                  <p>{m.text}</p>
                  <small>
                    {m.time}
                    {m.sender === "me" && <CheckCheck aria-label={t("Sent")} />}
                  </small>
                </div>
              </div>
            ))}
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
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("Write a message")}
              aria-label={t("Write a message")}
              maxLength={2000}
            />
            <IconButton
              type="submit"
              variant="solid"
              label={t("messages.send")}
              icon={<Send />}
              disabled={!message.trim()}
            />
          </form>
        </section>
      </div>
    </>
  );
}
