"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CheckCheck,
  ChevronRight,
  Heart,
  Home,
  Leaf,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { getCompatibility } from "@/lib/matching";
import { EmptyState } from "../ui";
import { PageHeading } from "../shared";
import { useApp, profileById } from "../app/controller";

export function MessagesView() {
  const {
    t,
    state,
    setState,
    setDialog,
    setSelected,
    setActiveChat,
    message,
    setMessage,
    chatSearch,
    setChatSearch,
    pendingReplies,
    mobileChat,
    setMobileChat,
    chatEnd,
    chat,
    chatPerson,
    changeView,
    openProfile,
    sendMessage,
  } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="messages-page"
    >
      <PageHeading
        eyebrow={t("FROM HELLO TO HOME")}
        title={t("messages.title")}
        description={t("messages.subtitle")}
      />
      <div className={`messenger ${mobileChat ? "show-conversation" : ""}`}>
        <aside className="conversation-list">
          <label className="chat-search">
            <Search size={17} />
            <input
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder={t("Search conversations")}
              aria-label={t("Search conversations")}
            />
          </label>
          <div className="list-label">
            {t("YOUR PEOPLE")}
            <span>{state.chats.length}</span>
          </div>
          {state.chats
            .filter((c) =>
              profileById(c.profileId)
                ?.name.toLowerCase()
                .includes(chatSearch.toLowerCase()),
            )
            .map((c) => {
              const p = profileById(c.profileId);
              return (
                <button
                  key={c.id}
                  className={`conversation-item ${chat?.id === c.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveChat(c.id);
                    setMobileChat(true);
                    setState((s) => ({
                      ...s,
                      chats: s.chats.map((ch) =>
                        ch.id === c.id ? { ...ch, unread: 0 } : ch,
                      ),
                    }));
                  }}
                >
                  <img src={p.photo} alt="" />
                  <span>
                    <strong>
                      {p.name}
                      <small>{c.messages.at(-1)?.time || t("New")}</small>
                    </strong>
                    <p>
                      {c.messages.at(-1)?.text ||
                        t("You matched! Say a little hello.")}
                    </p>
                  </span>
                  {c.unread > 0 && <i>{c.unread}</i>}
                </button>
              );
            })}
          <div className="chat-list-foot">
            <ShieldCheck size={16} />
            {t("A conversation starts with a mutual like.")}
          </div>
        </aside>
        {chat && chatPerson ? (
          <section className="conversation">
            <div className="conversation-header">
              <button
                className="icon-button chat-back"
                aria-label={t("Back to conversations")}
                onClick={() => setMobileChat(false)}
              >
                <ArrowLeft size={20} />
              </button>
              <img src={chatPerson.photo} alt="" />
              <button
                className="chat-person"
                onClick={() => openProfile(chatPerson)}
              >
                <strong>
                  {chatPerson.name}
                  {chatPerson.verified && <BadgeCheck size={16} />}
                </strong>
                <small>
                  <span />
                  {t("Demo conversation")}
                </small>
              </button>
              <button
                className="icon-button"
                aria-label={t("Conversation options")}
                onClick={() => {
                  setSelected(chatPerson);
                  setDialog("report");
                }}
              >
                <MoreHorizontal size={22} />
              </button>
            </div>
            <div className="chat-fit-strip">
              <Leaf size={15} />
              {getCompatibility(chatPerson, state.preferences, t).score}%{" "}
              {t("lifestyle fit")}
              <button
                onClick={() => {
                  setSelected(chatPerson);
                  setDialog("compatibility");
                }}
              >
                {t("Get to know your fit")}
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="message-stream">
              <div className="match-date">
                <Heart size={13} />
                {t("You found a little common ground.")}
              </div>
              {chat.messages.length === 0 && (
                <div className="chat-starter">
                  <span className="small-spark">
                    <Sparkles size={24} />
                  </span>
                  <h3>{t("Every home starts with a hello.")}</h3>
                  <p>
                    {t("Skip the small talk. Ask about the little things.")}
                  </p>
                  {[
                    "What’s your ideal Sunday at home?",
                    "How do you feel about a shared cleaning routine?",
                    "Want to grab a coffee and talk about the room?",
                  ].map((prompt) => (
                    <button key={prompt} onClick={() => sendMessage(t(prompt))}>
                      {t(prompt)}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              )}
              {chat.messages.map((m) => (
                <div
                  className={`message-row ${m.sender === "me" ? "mine" : ""}`}
                  key={m.id}
                >
                  {m.sender === "them" && <img src={chatPerson.photo} alt="" />}
                  <div className="message-bubble">
                    <p>{m.text}</p>
                    <small>
                      {m.time}
                      {m.sender === "me" && <CheckCheck size={13} />}
                    </small>
                  </div>
                </div>
              ))}
              {(pendingReplies[chat.id] ?? 0) > 0 && (
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div className="shared-space-link">
              <Home size={18} />
              <span>
                {t("Turn a good conversation into a home.")}
                <small>{t("Save places and plan your move together.")}</small>
              </span>
              <button
                aria-label={t("Open our space")}
                onClick={() => changeView("space")}
              >
                <ArrowUpRight size={21} />
              </button>
            </div>
            <form
              className="message-composer"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <button
                type="button"
                className="icon-button"
                aria-label={t("Add a smile")}
                onClick={() => setMessage((m) => m + " ☺")}
              >
                <Smile size={22} />
              </button>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messages.placeholder")}
                aria-label={t("messages.placeholder")}
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="send-button"
                aria-label={t("messages.send")}
              >
                <Send size={19} />
              </button>
            </form>
            <span className="simulation-caption">
              {t("Demo replies are simulated. No messages leave this device.")}
            </span>
          </section>
        ) : (
          <EmptyState
            icon={MessageCircle}
            title={t("A hello is just a match away.")}
            body={t("Like someone back to start your first conversation.")}
            action={() => changeView("discover")}
            label={t("Meet your people")}
          />
        )}
      </div>
    </motion.div>
  );
}
