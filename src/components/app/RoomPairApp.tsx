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
import { getCompatibility, rankProfiles } from "@/lib/matching";
import { matchingPreferences, missingRequired } from "@/lib/profile";
import { useAppearance } from "@/lib/appearance";
import { useAppData } from "@/lib/app-data";
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
import { BlockedDialog } from "./dialogs/BlockedDialog";
import { Onboarding } from "./Onboarding";
import { Brand } from "./Brand";
import { AuthScreen } from "./AuthScreen";
import s from "./AppShell.module.css";

type Dialog =
  | "filters"
  | "profile"
  | "match"
  | "help"
  | "settings"
  | "report"
  | "blocked"
  | null;

/**
 * A unique id for a message. crypto.randomUUID only exists on HTTPS and
 * localhost, and the app is also opened from phones over plain HTTP on the
 * local network, where calling it would crash the conversation.
 */
const newId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

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
  const {
    state,
    setState,
    ready,
    reset,
    saveFailed,
    profiles,
    account,
    simulatesReplies,
  } = useAppData();
  // Conversations only ever point at people the member can see: saved demo
  // state is validated on load, and the server hides everyone else.
  const profileById = (id: string) => profiles.find((p) => p.id === id)!;
  const {
    appearance,
    theme: resolvedTheme,
    update: setAppearance,
  } = useAppearance();
  const [view, setView] = useState<View>("discover");
  /** A sub-page of Profile, shown with a back button in the top bar. */
  const [sub, setSub] = useState<null | "edit" | "settings">(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  // false = closed; a number = open at that step.
  const [onboarding, setOnboarding] = useState<false | number>(false);
  const [setupSkipped, setSetupSkipped] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  /** On phones an open conversation is a sub-page: back and name in the top bar. */
  const [chatOpen, setChatOpen] = useState(false);
  /** Likes: the person opened from a tile, shown as a sub-page. */
  const [likeOpen, setLikeOpen] = useState<string | null>(null);
  const narrow = useNarrow();
  // Simulated replies still on their way, per conversation, so one reply
  // arriving does not hide the typing dots of another conversation.
  const [pendingReplies, setPendingReplies] = useState<Record<string, number>>(
    {},
  );
  const [direction, setDirection] = useState(1);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** The page on screen and how it arrived (push, pop or a tab fade). */
  const shown = useRef<{ page: string; motion: PageMotion }>({
    page: "discover",
    motion: "fade",
  });

  const matchPrefs = matchingPreferences(state.me, state.preferences);
  const ranked = rankProfiles(profiles, matchPrefs, t).filter(
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

  /** Leaves nothing of one member's session on screen for the next one. */
  function signOut() {
    replyTimers.current.forEach(clearTimeout);
    replyTimers.current = [];
    setPendingReplies({});
    setView("discover");
    setSub(null);
    setDialog(null);
    setOnboarding(false);
    setSetupSkipped(false);
    setSelected(null);
    setActiveChat(null);
    setChatOpen(false);
    setLikeOpen(null);
    account?.signOut();
  }
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
                  id: newId(),
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
    setPendingReplies((pending) => ({
      ...pending,
      [id]: (pending[id] ?? 0) + 1,
    }));
    // Real members answer for themselves; only demo people get canned replies.
    if (!simulatesReplies) return;
    const timer = setTimeout(() => {
      // Canned answers, in the app's language. The cue words cover both
      // bundled languages; anything else gets the general answer.
      const lower = body.toLocaleLowerCase();
      const mentions = (...words: string[]) =>
        words.some((word) => lower.includes(word));
      const answer = !body
        ? t("Thanks for the photo! That helps a lot.")
        : mentions("budget", "rent", "bütçe", "kira")
          ? t(
              "I’m thinking around €450–550 including bills. What feels comfortable for you?",
            )
          : mentions("coffee", "meet", "kahve", "buluş", "görüş")
            ? t(
                "Coffee sounds lovely! How about Saturday at 11? There’s a nice little place near the market.",
              )
            : mentions("clean", "tidy", "temiz", "düzen")
              ? t(
                  "A quick tidy after cooking and a shared Sunday reset works for me. What’s your routine?",
                )
              : mentions("room", "flat", "oda", "daire", "ev")
                ? t(
                    "Happy to tell you more about the place. What would you like to know?",
                  )
                : t(
                    "That sounds good to me! I’m looking for a home where we can be honest, respect each other’s space, and share a coffee now and then.",
                  );
      setState((st) => ({
        ...st,
        chats: st.chats.map((c) =>
          c.id === id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: newId(),
                    sender: "them",
                    text: answer,
                    time: clock(),
                  },
                ],
              }
            : c,
        ),
      }));
      setPendingReplies((pending) => ({
        ...pending,
        [id]: Math.max(0, (pending[id] ?? 1) - 1),
      }));
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
        sub ||
        // With required fields missing, Discover shows a prompt instead of
        // the card; the keys must not act on a card nobody can see.
        missing.length > 0 ||
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
  if (account?.status === "signed-out") return <AuthScreen account={account} />;
  // A new member answers the living-together questions first; until then
  // nobody else can see them. They may close it and look around.
  const mustOnboard =
    account?.status === "signed-in" && !state.onboarded && !setupSkipped;

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
      palette={appearance.palette}
      theme={resolvedTheme}
      view={view}
      onNavigate={navigate}
      counts={{ likes: received.length, messages: unread }}
      onHelp={() => setDialog("help")}
      toast={
        toast ||
        (saveFailed
          ? account
            ? t("Some changes could not be saved. Check your connection.")
            : t(
                "Changes can’t be saved on this device. They last until you close this tab.",
              )
          : "")
      }
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
              match: getCompatibility(likePerson, matchPrefs, t),
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
            preferences={matchPrefs}
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
            typing={chat && pendingReplies[chat.id] ? chat.id : null}
            preferences={matchPrefs}
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
            appearance={appearance}
            onAppearance={setAppearance}
            account={account}
            onSignOut={signOut}
            onReset={() => {
              replyTimers.current.forEach(clearTimeout);
              replyTimers.current = [];
              setPendingReplies({});
              setActiveChat(null);
              setChatOpen(false);
              setLikeOpen(null);
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
            onBlocked={() => setDialog("blocked")}
            onIntent={changeIntent}
            onVerify={() =>
              // With accounts, only the server can mark someone verified.
              account
                ? notify(t("Student verification is not connected yet."))
                : setState((st) => ({
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
            match={getCompatibility(detail, matchPrefs, t)}
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
            fit={getCompatibility(detail, matchPrefs, t).score}
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
        {dialog === "blocked" && (
          <BlockedDialog
            key="blocked"
            people={profiles.filter((p) => state.blocked.includes(p.id))}
            onClose={() => setDialog(null)}
            onUnblock={(person) => {
              setState((st) => ({
                ...st,
                blocked: st.blocked.filter((id) => id !== person.id),
              }));
              notify(t("{name} is unblocked.", { name: person.name }));
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
                // Reporting the same person for the same reason twice adds nothing.
                reports: st.reports.some(
                  (r) => r.profileId === detail.id && r.reason === reason,
                )
                  ? st.reports
                  : [...st.reports, { profileId: detail.id, reason }],
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
                blocked: [...new Set([...st.blocked, detail.id])],
                chats: st.chats.filter((c) => c.profileId !== detail.id),
                // Forget the swipe too, so Undo never targets someone hidden.
                decisions: st.decisions.filter((d) => d.id !== detail.id),
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
        {(onboarding !== false || mustOnboard) && (
          <Onboarding
            key="onboarding"
            startStep={onboarding === false ? 0 : onboarding}
            initial={state.preferences}
            onClose={() => {
              setOnboarding(false);
              setSetupSkipped(true);
            }}
            onComplete={(preferences) => {
              setState((st) => ({ ...st, preferences, onboarded: true }));
              setOnboarding(false);
              // Setup can be opened from Edit profile; leave that sub-page,
              // or its title and back button would sit above Discover.
              setSub(null);
              setView("discover");
              notify(
                t("Profile saved. Hi, {name}!", { name: preferences.name }),
              );
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
