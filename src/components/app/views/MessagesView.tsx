"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CheckCheck,
  ChevronRight,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
} from "lucide-react";
import { Avatar, Button, EmptyState, IconButton } from "@/design-system";
import { getCompatibility } from "@/lib/matching";
import { useI18n } from "@/lib/i18n";
import type { Conversation, Preferences, Profile } from "@/lib/types";
import { PageHeader } from "../PageHeader";
import v from "./views.module.css";

const starters = [
  "What’s your ideal Sunday at home?",
  "How do you feel about a shared cleaning routine?",
  "Want to grab a coffee and talk about the room?",
];

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
  onSpace,
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
  onSpace: () => void;
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

  return (
    <>
      <PageHeader
        eyebrow={t("FROM HELLO TO HOME")}
        title={t("messages.title")}
        description={t("messages.subtitle")}
      />
      {!chat || !person ? (
        <EmptyState
          icon={<MessageCircle />}
          title={t("A hello is just a match away.")}
          body={t("Like someone back to start your first conversation.")}
          action={{ label: t("Meet your people"), onClick: onDiscover }}
        />
      ) : (
        <div className={v.messenger} data-show={showChat ? "chat" : "list"}>
          <aside className={v.chatList} aria-label={t("YOUR PEOPLE")}>
            <label className={v.chatSearch}>
              <Search aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search conversations")}
                aria-label={t("Search conversations")}
              />
            </label>
            <p className={v.listLabel}>
              {t("YOUR PEOPLE")} <span>{chats.length}</span>
            </p>
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
                            {last?.text ??
                              t("You matched! Say a little hello.")}
                          </span>
                        </span>
                        {c.unread > 0 && (
                          <span className={v.unread}>{c.unread}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
            </ul>
            <p className={v.listFoot}>
              <ShieldCheck aria-hidden="true" />
              {t("A conversation starts with a mutual like.")}
            </p>
          </aside>

          <section className={v.chat} aria-label={person.name}>
            <div className={v.chatHeader}>
              <IconButton
                className={v.chatBack}
                label={t("Back to conversations")}
                icon={<ArrowLeft />}
                onClick={() => setShowChat(false)}
              />
              <Avatar name={person.name} src={person.photo} />
              <button
                type="button"
                className={v.chatPerson}
                onClick={() => onOpenProfile(person)}
              >
                <strong>
                  {person.name}
                  {person.verified && (
                    <BadgeCheck aria-label={t("discover.verified")} />
                  )}
                </strong>
                <small>{t("Demo conversation")}</small>
              </button>
              <IconButton
                label={t("Conversation options")}
                icon={<MoreHorizontal />}
                onClick={() => onOptions(person)}
              />
            </div>
            <button
              type="button"
              className={v.fitStrip}
              onClick={() => onOpenProfile(person)}
            >
              <Heart aria-hidden="true" />
              {getCompatibility(person, preferences).score}%{" "}
              {t("lifestyle fit")}
              <span>
                {t("Get to know your fit")} <ChevronRight aria-hidden="true" />
              </span>
            </button>
            <div className={v.stream} aria-live="polite">
              <p className={v.matchNote}>
                <Heart aria-hidden="true" />{" "}
                {t("You found a little common ground.")}
              </p>
              {chat.messages.length === 0 && (
                <div className={v.starter}>
                  <Sparkles aria-hidden="true" />
                  <h3>{t("Every home starts with a hello.")}</h3>
                  <p>
                    {t("Skip the small talk. Ask about the little things.")}
                  </p>
                  {starters.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="secondary"
                      size="sm"
                      trailingIcon={<ArrowUpRight />}
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
                      {m.sender === "me" && <CheckCheck aria-label="sent" />}
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
            <button type="button" className={v.spaceLink} onClick={onSpace}>
              <Home aria-hidden="true" />
              <span>
                {t("Turn a good conversation into a home.")}
                <small>{t("Save places and plan your move together.")}</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </button>
            <form
              className={v.composer}
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <IconButton
                label={t("Add a smile")}
                icon={<Smile />}
                onClick={() => setMessage((m) => `${m} ☺`)}
              />
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messages.placeholder")}
                aria-label={t("messages.placeholder")}
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
            <p className={v.caption}>
              {t("Demo replies are simulated. No messages leave this device.")}
            </p>
          </section>
        </div>
      )}
    </>
  );
}
