"use client";
import {
  CircleHelp,
  MoreHorizontal,
  Settings,
  SlidersHorizontal,
  UserPen,
  UserRound,
} from "@/design-system/icons";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import {
  IconButton,
  PageTransition,
  TextProvider,
  type PageMotion,
} from "@/design-system";
import { profiles } from "@/lib/data";
import { getCompatibility, rankProfiles } from "@/lib/matching";
import { missingRequired } from "@/lib/profile";
import { useAppState } from "@/lib/store";
import { I18nProvider, useI18n } from "@/lib/i18n";
import type { Preferences, Profile } from "@/lib/types";
import type { DiscoverDeck } from "@/lib/discover/deck";
import { AppShell, type View } from "./AppShell";
import { DiscoverView, ProfileGate } from "./views/DiscoverView";
import { LikesView } from "./views/LikesView";
import { MessagesView } from "./views/MessagesView";
import { ProfileView } from "./views/ProfileView";
import { SettingsView } from "./views/SettingsView";
import { EditProfileView } from "./views/EditProfileView";
import { FiltersDialog } from "./dialogs/FiltersDialog";
import { ProfileDialog } from "./dialogs/ProfileDialog";
import { MatchDialog } from "./dialogs/MatchDialog";
import { HelpDialog } from "./dialogs/HelpDialog";
import { ReportDialog } from "./dialogs/ReportDialog";
import { Onboarding } from "./Onboarding";
import { Brand } from "./Brand";
import s from "./AppShell.module.css";

type Dialog =
  "filters" | "profile" | "match" | "help" | "settings" | "report" | null;

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
  /** A sub-page of Profile, shown with a back button in the top bar. */
  const [sub, setSub] = useState<null | "edit" | "settings">(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  // false = closed; a number = open at that step.
  const [onboarding, setOnboarding] = useState<false | number>(false);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  /** On phones an open conversation is a sub-page: back and name in the top bar. */
  const [chatOpen, setChatOpen] = useState(false);
  /** Likes: the person opened from a tile, shown as a sub-page. */
  const [likeOpen, setLikeOpen] = useState<string | null>(null);
  const narrow = useNarrow();
  const [typing, setTyping] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** The page on screen and how it arrived (push, pop or a tab fade). */
  const shown = useRef<{ page: string; motion: PageMotion }>({
    page: "discover",
    motion: "fade",
  });

  const ranked = rankProfiles(profiles, state.preferences, t).filter(
    ({ profile }) => !state.blocked.includes(profile.id),
  );
  const decided = (id: string) => state.decisions.some((d) => d.id === id);
  // Someone you already have a conversation with is not a stranger to
  // swipe on: keep them out of the deck (unless you decided on them here).
  const pool = ranked.filter(
    ({ profile }) =>
      decided(profile.id) ||
      !state.chats.some((c) => c.profileId === profile.id),
  );
  const queue = pool.filter(({ profile }) => !decided(profile.id));
  const current = queue[0];
  const missing = missingRequired(state.me, state.preferences);
  // People who liked you and are still waiting for your answer: not yet
  // decided on, and not already in a conversation with you.
  const received = ranked.filter(
    ({ profile }) =>
      profile.likesYou &&
      !state.decisions.some((d) => d.id === profile.id) &&
      !state.chats.some((c) => c.profileId === profile.id),
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

  function changeIntent(intent: "find-room" | "have-room") {
    setState((st) => ({
      ...st,
      preferences: { ...st.preferences, intent },
    }));
    notify(
      intent === "have-room"
        ? t("Discover now shows people looking for a room.")
        : t("Discover now shows people who have a room."),
    );
  }
  function openSub(next: "edit" | "settings") {
    setSub(next);
    window.scrollTo({ top: 0 });
  }
  function navigate(next: View) {
    setView(next);
    setSub(null);
    setChatOpen(false);
    setLikeOpen(null);
    // Wide screens show the first conversation at once; phones show the list.
    if (next === "messages" && chat && !narrow) markRead(chat.id);
    window.scrollTo({ top: 0 });
  }
  function openProfile(p: Profile) {
    setSelected(p);
    setDialog("profile");
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
    setChatOpen(true);
    setDialog(null);
    setView("messages");
    window.scrollTo({ top: 0 });
  }
  function decide(
    action: "like" | "pass",
    person: Profile | undefined = current?.profile,
  ) {
    if (!person) return;
    // Nobody can team up with a profile that is missing required fields.
    if (action === "like" && missing.length) {
      notify(
        t("Finish your profile first: {step}.", { step: t(missing[0].label) }),
      );
      return;
    }
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
  // Everyone you skipped or liked without a match comes back; people you
  // already have a conversation with stay out of the deck.
  function browseAgain() {
    setState((st) => ({
      ...st,
      decisions: st.decisions.filter((d) =>
        st.chats.some((c) => c.profileId === d.id),
      ),
    }));
    window.scrollTo({ top: 0 });
  }
  function sendMessage(text: string, photo?: string, chatId?: string) {
    const body = text.trim();
    const id = chatId ?? chat?.id;
    if ((!body && !photo) || !id) return;
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
                  ...(photo ? { photo } : {}),
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
      const answer = !body
        ? "Thanks for the photo! That helps a lot."
        : lower.includes("budget")
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

  // Arrow keys like and pass on the Discover card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        dialog ||
        onboarding !== false ||
        view !== "discover" ||
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
        index: pool.length - queue.length,
        total: pool.length,
      }
    : null;
  const detail = selected;
  const likePerson =
    view === "likes" && likeOpen ? profileById(likeOpen) : null;
  const closeLike = () => {
    setLikeOpen(null);
    window.scrollTo({ top: 0 });
  };
  const chatPerson =
    view === "messages" && chatOpen && narrow && chat
      ? profileById(chat.profileId)
      : null;
  // Which page is on screen: a tab ("likes") or a sub-page ("likes/ella").
  // Deeper in the same tab slides in (push), back out slides back (pop),
  // another tab fades. Idempotent, so a repeated render keeps the motion.
  const page = likePerson
    ? `likes/${likePerson.id}`
    : chatPerson
      ? "messages/chat"
      : sub
        ? `profile/${sub}`
        : view;
  if (shown.current.page !== page) {
    const [root, child] = page.split("/");
    const [prevRoot, prevChild] = shown.current.page.split("/");
    shown.current = {
      page,
      motion:
        root !== prevRoot || Boolean(child) === Boolean(prevChild)
          ? "fade"
          : child
            ? "push"
            : "pop",
    };
  }

  return (
    <AppShell
      view={view}
      onNavigate={navigate}
      counts={{ likes: received.length, messages: unread }}
      onHelp={() => setDialog("help")}
      toast={toast}
      title={
        likePerson
          ? likePerson.name
          : chatPerson
            ? chatPerson.name
            : sub === "edit"
              ? t("Edit profile")
              : sub === "settings"
                ? t("Settings")
                : t(`nav.${view}`)
      }
      onBack={
        likePerson
          ? closeLike
          : chatPerson
            ? () => setChatOpen(false)
            : sub
              ? () => {
                  setSub(null);
                  window.scrollTo({ top: 0 });
                }
              : undefined
      }
      actions={
        likePerson ? undefined : chatPerson ? (
          <>
            <IconButton
              variant="outline"
              label={`${t("discover.viewProfile")}: ${chatPerson.name}`}
              icon={<UserRound />}
              onClick={() => openProfile(chatPerson)}
            />
            <IconButton
              variant="outline"
              label={t("Conversation options")}
              icon={<MoreHorizontal />}
              onClick={() => {
                setSelected(chatPerson);
                setDialog("report");
              }}
            />
          </>
        ) : sub ? undefined : view === "discover" ? (
          <IconButton
            variant="outline"
            label={t("discover.filters")}
            icon={<SlidersHorizontal />}
            onClick={() => setDialog("filters")}
          />
        ) : view === "profile" && !sub ? (
          <>
            <IconButton
              variant="outline"
              label={t("Settings")}
              icon={<Settings />}
              onClick={() => openSub("settings")}
            />
            <IconButton
              variant="outline"
              label={t("Help")}
              icon={<CircleHelp />}
              onClick={() => setDialog("help")}
            />
            <IconButton
              variant="outline"
              label={t("Edit profile")}
              icon={<UserPen />}
              onClick={() => openSub("edit")}
            />
          </>
        ) : undefined
      }
    >
      <PageTransition transitionKey={page} motion={shown.current.motion}>
        {view === "discover" && missing.length > 0 && (
          <ProfileGate
            missing={missing}
            onComplete={() => {
              setView("profile");
              openSub("edit");
            }}
          />
        )}
        {view === "discover" && missing.length === 0 && (
          <DiscoverView
            deck={deck}
            roomFirst={state.preferences.intent !== "have-room"}
            canUndo={state.decisions.length > 0}
            rankedCount={ranked.length}
            canBrowseAgain={ranked.some(
              ({ profile }) =>
                !state.chats.some((c) => c.profileId === profile.id),
            )}
            seen={{
              liked: pool.filter(({ profile }) =>
                state.decisions.some(
                  (d) => d.id === profile.id && d.action === "like",
                ),
              ).length,
              skipped: pool.filter(({ profile }) =>
                state.decisions.some(
                  (d) => d.id === profile.id && d.action === "pass",
                ),
              ).length,
              // The last three people you decided on, most recent first.
              faces: state.decisions
                .slice(-3)
                .reverse()
                .map((d) => profileById(d.id).photo),
            }}
            onFilters={() => setDialog("filters")}
            onBrowseAgain={browseAgain}
            onUndo={undo}
            viewer={state.preferences}
            onReport={(p) => {
              setSelected(p);
              setDialog("report");
            }}
          />
        )}
        {view === "likes" && likePerson && (
          // Someone who liked you, as a sub-page: the Discover card and
          // details, with Skip / Team up.
          <DiscoverView
            key={likePerson.id}
            deck={{
              profile: likePerson,
              match: getCompatibility(likePerson, state.preferences, t),
              cardKey: likePerson.id,
              exitDirection: direction,
              canUndo: false,
              decide: (d) => {
                decide(d, likePerson);
                closeLike();
              },
              undo: () => {},
              index: 0,
              total: 1,
            }}
            roomFirst={state.preferences.intent !== "have-room"}
            canUndo={false}
            rankedCount={1}
            onFilters={() => setDialog("filters")}
            onBrowseAgain={browseAgain}
            onUndo={undo}
            viewer={state.preferences}
            showUndo={false}
            onReport={(p) => {
              setSelected(p);
              setDialog("report");
            }}
          />
        )}
        {view === "likes" && !likePerson && (
          <LikesView
            received={received.map((r) => r.profile)}
            preferences={state.preferences}
            onOpen={(p) => {
              setLikeOpen(p.id);
              window.scrollTo({ top: 0 });
            }}
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
            showChat={chatOpen}
            onSelect={(id) => {
              setActiveChat(id);
              markRead(id);
              setChatOpen(true);
            }}
            onSend={sendMessage}
            onError={notify}
            onOpenProfile={openProfile}
            onOptions={(p) => {
              setSelected(p);
              setDialog("report");
            }}
            onDiscover={() => navigate("discover")}
          />
        )}
        {view === "profile" && sub === "settings" && (
          <SettingsView
            onReset={() => {
              reset();
              setSub(null);
              setView("discover");
              notify(t("Demo data reset."));
            }}
          />
        )}
        {view === "profile" && sub === "edit" && (
          <EditProfileView
            preferences={state.preferences}
            me={state.me}
            onMe={(next) =>
              setState((st) => ({ ...st, me: { ...st.me, ...next } }))
            }
            onEditBasics={(step) => setOnboarding(step)}
            onError={notify}
            onName={(name) =>
              setState((st) => ({
                ...st,
                preferences: { ...st.preferences, name },
              }))
            }
            onIntent={changeIntent}
          />
        )}
        {view === "profile" && !sub && (
          <ProfileView
            preferences={state.preferences}
            me={state.me}
            counts={{
              likes: received.length,
              matches: state.chats.length,
              blocked: state.blocked.length,
              reports: state.reports.length,
            }}
            onEdit={() => openSub("edit")}
            onHelp={() => setDialog("help")}
            onIntent={changeIntent}
            onVerify={() =>
              setState((st) => ({
                ...st,
                me: { ...st.me, verified: !st.me.verified },
              }))
            }
            onLikes={() => navigate("likes")}
            onMatches={() => navigate("messages")}
          />
        )}
      </PageTransition>

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
            onInvalid={() => notify(t("Check the highlighted fields."))}
          />
        )}
        {dialog === "profile" && detail && (
          <ProfileDialog
            key="profile"
            profile={detail}
            match={getCompatibility(detail, state.preferences, t)}
            viewer={state.preferences}
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
            you={{
              name: state.preferences.name,
              photo: state.me.photos[0] ?? "",
            }}
            fit={getCompatibility(detail, state.preferences, t).score}
            roomFirst={state.preferences.intent !== "have-room"}
            onClose={() => setDialog(null)}
            onSend={(text) => {
              openChat(detail);
              sendMessage(text, undefined, `chat-${detail.id}`);
            }}
          />
        )}
        {dialog === "help" && (
          <HelpDialog
            key="help"
            onClose={() => setDialog(null)}
            onStart={() => {
              setDialog(null);
              setOnboarding(0);
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
              // Leave any page that still shows the blocked person.
              if (likeOpen === detail.id) setLikeOpen(null);
              if (chat?.profileId === detail.id) {
                setActiveChat(null);
                setChatOpen(false);
              }
              setDialog(null);
              notify(t("Profile blocked and conversation removed."));
            }}
          />
        )}
        {onboarding !== false && (
          <Onboarding
            key="onboarding"
            startStep={onboarding}
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

/** True below the width where the list and the chat sit side by side. */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 859px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}
