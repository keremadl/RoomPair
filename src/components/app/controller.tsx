"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { profiles, rooms } from "@/lib/data";
import { getCompatibility, rankProfiles } from "@/lib/matching";
import { useAppState } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { Profile, Preferences, Room } from "@/lib/types";

export type View = "discover" | "likes" | "messages" | "space" | "profile";
export type Dialog =
  | "filters"
  | "details"
  | "compatibility"
  | "settings"
  | "help"
  | "room"
  | "match"
  | "report"
  | null;
/** Today's date in the user's time zone, as YYYY-MM-DD. */
export const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};
// Stored chats are sanitized in store.ts, so every chat points at a known profile.
export const profileById = (id: string) => profiles.find((p) => p.id === id)!;

/**
 * All interface state and actions of the demo: navigation, the discovery
 * queue, likes, chats, rooms and dialogs. Pages and dialogs read it through
 * useApp(), so none of them owns business rules.
 */
function useRoomPairController() {
  const {
    t,
    locale,
    setLocale,
    locales,
    isLoading: languageLoading,
    error: languageError,
  } = useI18n();
  const { state, setState, ready, reset, storageFailed } = useAppState();
  const dateLabel = (date: string) => {
    const value = new Date(date + "T12:00:00");
    return Number.isNaN(value.getTime())
      ? date
      : value.toLocaleDateString(locale === "en" ? "en-GB" : locale, {
          day: "numeric",
          month: "short",
        });
  };
  const [view, setView] = useState<View>("discover");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [onboarding, setOnboarding] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterDraft, setFilterDraft] = useState<Preferences>(
    state.preferences,
  );
  const [mode, setMode] = useState<"people" | "rooms">("people");
  const [listView, setListView] = useState(false);
  const [likesTab, setLikesTab] = useState<"received" | "sent">("received");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [toast, setToast] = useState("");
  // The photo position belongs to one card, so it resets when the card changes.
  const [photo, setPhoto] = useState({ id: "", index: 0 });
  const [direction, setDirection] = useState(1);
  const [reportReason, setReportReason] = useState("Misleading profile");
  // Simulated replies still on their way, per chat, so the typing indicator
  // stays visible until the last one arrives.
  const [pendingReplies, setPendingReplies] = useState<Record<string, number>>(
    {},
  );
  const [mobileChat, setMobileChat] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatEnd = useRef<HTMLDivElement>(null);
  const ranked = rankProfiles(profiles, state.preferences, t).filter(
    ({ profile }) => !state.blocked.includes(profile.id),
  );
  const queue = ranked.filter(
    ({ profile }) => !state.decisions.some((d) => d.id === profile.id),
  );
  const current = queue[0]?.profile;
  const next = queue[1]?.profile;
  const match = current
    ? getCompatibility(current, state.preferences, t)
    : null;
  const detail = selected || current;
  const chat = state.chats.find((c) => c.id === activeChat) || state.chats[0];
  const chatPerson = chat ? profileById(chat.profileId) : null;
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
  // Counts only the must-haves that actually narrow the feed.
  const activeFilters = [
    state.preferences.smokeFree,
    !state.preferences.petsOkay,
    state.preferences.verifiedOnly,
  ].filter(Boolean).length;
  // Rooms follow the same must-haves as people: budget, smoking, pets, blocks.
  const roomFits = (room: Room) => {
    const host = profiles.find((p) => `room-${p.id}` === room.id);
    const prefs = state.preferences;
    return (
      !!host &&
      !state.blocked.includes(host.id) &&
      room.price >= prefs.budgetMin &&
      room.price <= prefs.budgetMax &&
      !(prefs.smokeFree && host.habits.smoking) &&
      !(!prefs.petsOkay && host.habits.pets)
    );
  };
  const visibleRooms = rooms.filter(roomFits);
  const savedRooms = rooms.filter(
    (room) =>
      state.savedRooms.includes(room.id) &&
      !state.blocked.includes(room.id.replace(/^room-/, "")),
  );

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
  const photoIndex = photo.id === current?.id ? photo.index : 0;
  const setPhotoIndex = (index: number) =>
    setPhoto({ id: current?.id ?? "", index });
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chat?.messages.length, pendingReplies]);
  function changeView(v: View) {
    setView(v);
    setMobileChat(false);
    if (v === "messages" && chat)
      setState((s) => ({
        ...s,
        chats: s.chats.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c)),
      }));
  }
  function openFilters() {
    setFilterDraft({ ...state.preferences });
    setDialog("filters");
  }
  function openProfile(p: Profile) {
    setSelected(p);
    setDialog("details");
  }
  function openChat(profile: Profile) {
    const existing = state.chats.find((c) => c.profileId === profile.id);
    if (!existing && !profile.likesYou) {
      notify(t("A conversation opens when you both like each other."));
      return;
    }
    const id = existing?.id || `chat-${profile.id}`;
    if (!existing)
      setState((s) => ({
        ...s,
        chats: [
          ...s.chats,
          {
            id,
            profileId: profile.id,
            messages: [],
            unread: 0,
            matchedAt: new Date().toISOString(),
          },
        ],
      }));
    else
      setState((s) => ({
        ...s,
        chats: s.chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
      }));
    setActiveChat(id);
    setView("messages");
    setMobileChat(true);
    setDialog(null);
  }
  function decide(action: "like" | "pass", person = current) {
    if (!person) return;
    setDirection(action === "like" ? 1 : -1);
    setState((s) => ({
      ...s,
      decisions: [
        ...s.decisions.filter((d) => d.id !== person.id),
        { id: person.id, action },
      ],
    }));
    if (action === "like" && person.likesYou) {
      setSelected(person);
      setDialog("match");
      if (!state.chats.some((c) => c.profileId === person.id))
        setState((s) => ({
          ...s,
          chats: [
            ...s.chats,
            {
              id: `chat-${person.id}`,
              profileId: person.id,
              messages: [],
              unread: 0,
              matchedAt: new Date().toISOString(),
            },
          ],
        }));
    } else {
      setDialog(null);
      notify(
        action === "like"
          ? t("Like sent. A little hello goes a long way.")
          : t("Passed. Your kind of person is still out there."),
      );
    }
  }
  function undo() {
    if (!state.decisions.length) return;
    const last = state.decisions.at(-1)!;
    setState((s) => ({
      ...s,
      decisions: s.decisions.slice(0, -1),
      chats: s.chats.filter(
        (c) => !(c.profileId === last.id && c.messages.length === 0),
      ),
    }));
    notify(t("Last swipe undone."));
  }
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement;
      if (
        dialog ||
        onboarding ||
        view !== "discover" ||
        mode !== "people" ||
        listView ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) ||
        element.isContentEditable
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
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  function sendMessage(text = message) {
    if (!text.trim() || !chat) return;
    const id = chat.id;
    const body = text.trim();
    setMessage("");
    setState((s) => ({
      ...s,
      chats: s.chats.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: crypto.randomUUID(),
                  sender: "me",
                  text: body,
                  time: new Date().toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
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
    const timer = setTimeout(() => {
      // Keyword cues in both bundled languages; other languages get the default.
      const lower = body.toLocaleLowerCase(locale);
      const mentions = (...words: string[]) =>
        words.some((word) => lower.includes(word));
      const answer = t(
        mentions("budget", "bütçe", "kira")
          ? "reply.budget"
          : mentions("coffee", "meet", "kahve", "buluş")
            ? "reply.meet"
            : mentions("clean", "temiz")
              ? "reply.clean"
              : mentions("room", "flat", "oda", "daire")
                ? "reply.room"
                : "reply.default",
      );
      setState((s) => ({
        ...s,
        chats: s.chats.map((c) =>
          c.id === id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: crypto.randomUUID(),
                    sender: "them",
                    text: answer,
                    time: new Date().toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
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
  function toggleRoom(id: string) {
    setState((s) => ({
      ...s,
      savedRooms: s.savedRooms.includes(id)
        ? s.savedRooms.filter((r) => r !== id)
        : [...s.savedRooms, id],
    }));
  }
  function toggleTask(id: string) {
    setState((s) => ({
      ...s,
      checklist: s.checklist.includes(id)
        ? s.checklist.filter((x) => x !== id)
        : [...s.checklist, id],
    }));
  }
  return {
    t,
    locale,
    setLocale,
    locales,
    languageLoading,
    languageError,
    state,
    setState,
    ready,
    reset,
    storageFailed,
    dateLabel,
    view,
    setView,
    dialog,
    setDialog,
    onboarding,
    setOnboarding,
    selected,
    setSelected,
    selectedRoom,
    setSelectedRoom,
    filterDraft,
    setFilterDraft,
    mode,
    setMode,
    listView,
    setListView,
    likesTab,
    setLikesTab,
    setActiveChat,
    message,
    setMessage,
    chatSearch,
    setChatSearch,
    toast,
    photo,
    direction,
    reportReason,
    setReportReason,
    pendingReplies,
    setPendingReplies,
    mobileChat,
    setMobileChat,
    replyTimers,
    chatEnd,
    ranked,
    queue,
    current,
    next,
    match,
    detail,
    chat,
    chatPerson,
    received,
    sent,
    unread,
    activeFilters,
    visibleRooms,
    savedRooms,
    notify,
    photoIndex,
    setPhotoIndex,
    changeView,
    openFilters,
    openProfile,
    openChat,
    decide,
    undo,
    sendMessage,
    toggleRoom,
    toggleTask,
  };
}

type AppController = ReturnType<typeof useRoomPairController>;
const AppContext = createContext<AppController | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppContext.Provider value={useRoomPairController()}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppController {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
