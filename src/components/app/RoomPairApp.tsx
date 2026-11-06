"use client";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { TextProvider } from "@/design-system";
import { profiles, rooms } from "@/lib/data";
import { getCompatibility, rankProfiles } from "@/lib/matching";
import { useAppState } from "@/lib/store";
import { I18nProvider, useI18n } from "@/lib/i18n";
import type { Preferences, Profile, Room } from "@/lib/types";
import type { DiscoverDeck } from "@/lib/discover/deck";
import { AppShell, type View } from "./AppShell";
import { DiscoverView } from "./views/DiscoverView";
import { LikesView } from "./views/LikesView";
import { MessagesView } from "./views/MessagesView";
import { SpaceView } from "./views/SpaceView";
import { ProfileView } from "./views/ProfileView";
import { FiltersDialog } from "./dialogs/FiltersDialog";
import { ProfileDialog } from "./dialogs/ProfileDialog";
import { MatchDialog } from "./dialogs/MatchDialog";
import { RoomDialog } from "./dialogs/RoomDialog";
import { HelpDialog } from "./dialogs/HelpDialog";
import { SettingsDialog } from "./dialogs/SettingsDialog";
import { ReportDialog } from "./dialogs/ReportDialog";
import { Onboarding } from "./Onboarding";
import { Brand } from "./Brand";
import s from "./AppShell.module.css";

type Dialog =
  | "filters"
  | "profile"
  | "match"
  | "room"
  | "help"
  | "settings"
  | "report"
  | null;

const profileById = (id: string) => profiles.find((p) => p.id === id)!;
const clock = () =>
  new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function RoomPair() {
  return (
    <I18nProvider>
      <MotionConfig reducedMotion="user">
        <Translated />
      </MotionConfig>
    </I18nProvider>
  );
}

/** Hands the app's translator to the design system's built-in copy. */
function Translated() {
  const { t } = useI18n();
  return (
    <TextProvider t={t}>
      <RoomPairApp />
    </TextProvider>
  );
}

function RoomPairApp() {
  const { t } = useI18n();
  const { state, setState, ready, reset } = useAppState();
  const [view, setView] = useState<View>("discover");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [onboarding, setOnboarding] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [mode, setMode] = useState<"people" | "rooms">("people");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [typing, setTyping] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const ranked = rankProfiles(profiles, state.preferences).filter(
    ({ profile }) => !state.blocked.includes(profile.id),
  );
  const queue = ranked.filter(
    ({ profile }) => !state.decisions.some((d) => d.id === profile.id),
  );
  const current = queue[0];
  const received = ranked.filter(
    ({ profile }) =>
      profile.likesYou && !state.decisions.some((d) => d.id === profile.id),
  );
  const sent = profiles.filter(
    (p) =>
      state.decisions.some((d) => d.id === p.id && d.action === "like") &&
      !state.blocked.includes(p.id),
  );
  const unread = state.chats.reduce((n, c) => n + c.unread, 0);
  const chat = state.chats.find((c) => c.id === activeChat) ?? state.chats[0];

  const notify = (text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3300);
  };
  useEffect(
    () => () => {
      replyTimers.current.forEach(clearTimeout);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const markRead = (id: string) =>
    setState((st) => ({
      ...st,
      chats: st.chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    }));

  function navigate(next: View) {
    setView(next);
    if (next === "messages" && chat) markRead(chat.id);
    window.scrollTo({ top: 0 });
  }
  function openProfile(p: Profile) {
    setSelected(p);
    setDialog("profile");
  }
  function openRoom(room: Room) {
    setSelectedRoom(room);
    setDialog("room");
  }
  function ensureChat(person: Profile) {
    if (!state.chats.some((c) => c.profileId === person.id))
      setState((st) => ({
        ...st,
        chats: [
          ...st.chats,
          {
            id: `chat-${person.id}`,
            profileId: person.id,
            messages: [],
            unread: 0,
            matchedAt: new Date().toISOString(),
          },
        ],
      }));
  }
  function openChat(person: Profile) {
    const existing = state.chats.find((c) => c.profileId === person.id);
    if (!existing && !person.likesYou) {
      notify(t("A chat opens when you both press Team up."));
      return;
    }
    ensureChat(person);
    const id = existing?.id ?? `chat-${person.id}`;
    markRead(id);
    setActiveChat(id);
    setDialog(null);
    setView("messages");
    window.scrollTo({ top: 0 });
  }
  function decide(
    action: "like" | "pass",
    person: Profile | undefined = current?.profile,
  ) {
    if (!person) return;
    setDirection(action === "like" ? 1 : -1);
    setState((st) => ({
      ...st,
      decisions: [
        ...st.decisions.filter((d) => d.id !== person.id),
        { id: person.id, action },
      ],
    }));
    if (action === "like" && person.likesYou) {
      setSelected(person);
      setDialog("match");
      ensureChat(person);
    } else {
      setDialog(null);
      notify(
        action === "like"
          ? t("Sent. If they press Team up too, a chat opens.")
          : t("Skipped."),
      );
    }
  }
  function undo() {
    if (!state.decisions.length) return;
    const last = state.decisions.at(-1)!;
    setDirection(-1);
    setState((st) => ({
      ...st,
      decisions: st.decisions.slice(0, -1),
      chats: st.chats.filter(
        (c) => !(c.profileId === last.id && c.messages.length === 0),
      ),
    }));
    notify(t("Last swipe undone."));
  }
  function browseAgain() {
    setState((st) => ({
      ...st,
      decisions: st.decisions.filter((d) => d.action === "like"),
    }));
  }
  function sendMessage(text: string) {
    const body = text.trim();
    if (!body || !chat) return;
    const id = chat.id;
    setState((st) => ({
      ...st,
      chats: st.chats.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: crypto.randomUUID(),
                  sender: "me",
                  text: body,
                  time: clock(),
                },
              ],
            }
          : c,
      ),
    }));
    setTyping(id);
    const timer = setTimeout(() => {
      const lower = body.toLowerCase();
      const answer = lower.includes("budget")
        ? "I’m thinking around €450–550 including bills. What feels comfortable for you?"
        : lower.includes("coffee") || lower.includes("meet")
          ? "Coffee sounds lovely! How about Saturday at 11? There’s a nice little place near the market."
          : lower.includes("clean")
            ? "A quick tidy after cooking and a shared Sunday reset works for me. What’s your routine?"
            : lower.includes("room") || lower.includes("flat")
              ? "Yes! I’d love to compare places together. Let’s add our favourites to Our space."
              : "That sounds good to me! I’m looking for a home where we can be honest, respect each other’s space, and share a coffee now and then.";
      setState((st) => ({
        ...st,
        chats: st.chats.map((c) =>
          c.id === id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: crypto.randomUUID(),
                    sender: "them",
                    text: answer,
                    time: clock(),
                  },
                ],
              }
            : c,
        ),
      }));
      setTyping(null);
    }, 1600);
    replyTimers.current.push(timer);
  }
  function toggleRoom(id: string, announce = false) {
    const saved = state.savedRooms.includes(id);
    setState((st) => ({
      ...st,
      savedRooms: saved
        ? st.savedRooms.filter((r) => r !== id)
        : [...st.savedRooms, id],
    }));
    if (announce)
      notify(saved ? t("Removed from saved rooms.") : t("Saved to My space."));
  }
  function toggleTask(id: string) {
    setState((st) => ({
      ...st,
      checklist: st.checklist.includes(id)
        ? st.checklist.filter((x) => x !== id)
        : [...st.checklist, id],
    }));
  }

  // Arrow keys like and pass on the Discover card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        dialog ||
        onboarding ||
        view !== "discover" ||
        mode !== "people" ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
        el.isContentEditable ||
        el.getAttribute("role") === "tab" ||
        el.getAttribute("role") === "radio"
      )
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        decide("like");
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        decide("pass");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!ready)
    return (
      <div className={s.loading} role="status" aria-label={t("common.loading")}>
        <Brand />
      </div>
    );

  const deck: DiscoverDeck | null = current
    ? {
        profile: current.profile,
        match: current.match,
        cardKey: `${current.profile.id}-${state.decisions.length}`,
        exitDirection: direction,
        canUndo: state.decisions.length > 0,
        decide: (d) => decide(d),
        undo,
        index: ranked.length - queue.length,
        total: ranked.length,
      }
    : null;
  const detail = selected;

  return (
    <AppShell
      view={view}
      onNavigate={navigate}
      counts={{ likes: received.length, messages: unread }}
      userName={state.preferences.name}
      onHelp={() => setDialog("help")}
      onNotifications={() =>
        received.length ? navigate("likes") : notify(t("No new likes."))
      }
      toast={toast}
      barAction={
        view === "discover"
          ? {
              label: t("discover.filters"),
              icon: <SlidersHorizontal aria-hidden="true" />,
              onClick: () => setDialog("filters"),
            }
          : undefined
      }
    >
      {view === "discover" && (
        <DiscoverView
          deck={deck}
          mode={mode}
          onMode={setMode}
          canUndo={state.decisions.length > 0}
          rankedCount={ranked.length}
          savedRooms={state.savedRooms}
          onFilters={() => setDialog("filters")}
          onBrowseAgain={browseAgain}
          onUndo={undo}
          onOpenRoom={openRoom}
          onToggleRoom={(id) => toggleRoom(id, true)}
          onReport={(p) => {
            setSelected(p);
            setDialog("report");
          }}
        />
      )}
      {view === "likes" && (
        <LikesView
          received={received.map((r) => r.profile)}
          sent={sent}
          preferences={state.preferences}
          onOpenProfile={openProfile}
          onLikeBack={(p) => decide("like", p)}
          onSayHello={(p) =>
            p.likesYou
              ? openChat(p)
              : notify(
                  t(
                    "Waiting for them. A chat opens when they press Team up too.",
                  ),
                )
          }
          onDiscover={() => navigate("discover")}
        />
      )}
      {view === "messages" && (
        <MessagesView
          chats={state.chats}
          activeId={chat?.id ?? null}
          typing={typing}
          preferences={state.preferences}
          profileById={profileById}
          onSelect={(id) => {
            setActiveChat(id);
            markRead(id);
          }}
          onSend={sendMessage}
          onOpenProfile={openProfile}
          onOptions={(p) => {
            setSelected(p);
            setDialog("report");
          }}
          onDiscover={() => navigate("discover")}
        />
      )}
      {view === "space" && (
        <SpaceView
          state={state}
          rooms={rooms}
          onOpenRoom={openRoom}
          onToggleRoom={(id) => toggleRoom(id, true)}
          onToggleTask={toggleTask}
          onNotes={(notes) => setState((st) => ({ ...st, notes }))}
          onViewing={(roomId, viewing) =>
            setState((st) => ({
              ...st,
              viewings: { ...st.viewings, [roomId]: viewing },
            }))
          }
          onExploreRooms={() => {
            setMode("rooms");
            navigate("discover");
          }}
        />
      )}
      {view === "profile" && (
        <ProfileView
          preferences={state.preferences}
          onboarded={state.onboarded}
          onEdit={() => setOnboarding(true)}
          onSettings={() => setDialog("settings")}
        />
      )}

      <AnimatePresence>
        {dialog === "filters" && (
          <FiltersDialog
            key="filters"
            initial={state.preferences}
            onClose={() => setDialog(null)}
            onApply={(preferences: Preferences) => {
              setState((st) => ({ ...st, preferences }));
              setDialog(null);
              notify(t("Filters updated."));
            }}
            onInvalid={() =>
              notify(t("Your maximum budget must be above your minimum."))
            }
          />
        )}
        {dialog === "profile" && detail && (
          <ProfileDialog
            key="profile"
            profile={detail}
            match={getCompatibility(detail, state.preferences)}
            liked={state.decisions.some(
              (d) => d.id === detail.id && d.action === "like",
            )}
            hasChat={state.chats.some((c) => c.profileId === detail.id)}
            onClose={() => setDialog(null)}
            onLike={() => decide("like", detail)}
            onChat={() => openChat(detail)}
            onReport={() => setDialog("report")}
          />
        )}
        {dialog === "match" && detail && (
          <MatchDialog
            key="match"
            profile={detail}
            userName={state.preferences.name}
            onClose={() => setDialog(null)}
            onChat={() => openChat(detail)}
          />
        )}
        {dialog === "room" && selectedRoom && (
          <RoomDialog
            key="room"
            room={selectedRoom}
            host={profiles.find((p) => `room-${p.id}` === selectedRoom.id)}
            saved={state.savedRooms.includes(selectedRoom.id)}
            onClose={() => setDialog(null)}
            onToggle={() => toggleRoom(selectedRoom.id, true)}
            onHost={(p) => openProfile(p)}
          />
        )}
        {dialog === "help" && (
          <HelpDialog
            key="help"
            onClose={() => setDialog(null)}
            onStart={() => {
              setDialog(null);
              setOnboarding(true);
            }}
          />
        )}
        {dialog === "settings" && (
          <SettingsDialog
            key="settings"
            onClose={() => setDialog(null)}
            onReset={() => {
              reset();
              setDialog(null);
              setView("discover");
              notify(t("Demo data reset."));
            }}
          />
        )}
        {dialog === "report" && detail && (
          <ReportDialog
            key="report"
            profile={detail}
            onClose={() => setDialog(null)}
            onReport={(reason) => {
              setState((st) => ({
                ...st,
                reports: [...st.reports, { profileId: detail.id, reason }],
              }));
              setDialog(null);
              notify(
                t(
                  "Demo report saved locally. No moderation service is connected.",
                ),
              );
            }}
            onBlock={() => {
              setState((st) => ({
                ...st,
                blocked: [...st.blocked, detail.id],
                chats: st.chats.filter((c) => c.profileId !== detail.id),
              }));
              setDialog(null);
              notify(t("Profile blocked and conversation removed."));
            }}
          />
        )}
        {onboarding && (
          <Onboarding
            key="onboarding"
            initial={state.preferences}
            onClose={() => setOnboarding(false)}
            onComplete={(preferences) => {
              setState((st) => ({ ...st, preferences, onboarded: true }));
              setOnboarding(false);
              setView("discover");
              notify(`${t("Profile saved. Hi,")} ${preferences.name}!`);
            }}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
