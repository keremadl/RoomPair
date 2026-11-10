"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Coffee,
  Compass,
  DoorOpen,
  Globe2,
  Heart,
  Home,
  KeyRound,
  Leaf,
  ListFilter,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Smile,
  Sofa,
  Sparkles,
  Sprout,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { profiles, rooms } from "@/lib/data";
import { getCompatibility, rankProfiles } from "@/lib/matching";
import { useAppState } from "@/lib/store";
import { I18nProvider, useI18n } from "@/lib/i18n";
import type { Profile, Preferences, Room } from "@/lib/types";
import { Brand, EmptyState, HomeIllustration, Modal } from "./ui";
import { Onboarding } from "./onboarding";
import { SwipeSurface } from "./swipe-surface";

type View = "discover" | "likes" | "messages" | "space" | "profile";
type Dialog =
  | "filters"
  | "details"
  | "compatibility"
  | "settings"
  | "help"
  | "room"
  | "match"
  | "report"
  | null;
const dateLabel = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
// Stored chats are sanitized in store.ts, so every chat points at a known profile.
const profileById = (id: string) => profiles.find((p) => p.id === id)!;

export default function RoomPair() {
  return (
    <I18nProvider>
      <MotionConfig reducedMotion="user">
        <RoomPairApp />
      </MotionConfig>
    </I18nProvider>
  );
}

function RoomPairApp() {
  const {
    t,
    locale,
    setLocale,
    locales,
    isLoading: languageLoading,
    error: languageError,
  } = useI18n();
  const { state, setState, ready, reset } = useAppState();
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
  const [photoIndex, setPhotoIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [reportReason, setReportReason] = useState("Misleading profile");
  const [typing, setTyping] = useState<string | null>(null);
  const [mobileChat, setMobileChat] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatEnd = useRef<HTMLDivElement>(null);
  const ranked = rankProfiles(profiles, state.preferences).filter(
    ({ profile }) => !state.blocked.includes(profile.id),
  );
  const queue = ranked.filter(
    ({ profile }) => !state.decisions.some((d) => d.id === profile.id),
  );
  const current = queue[0]?.profile;
  const next = queue[1]?.profile;
  const match = current ? getCompatibility(current, state.preferences) : null;
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
  useEffect(() => {
    setPhotoIndex(0);
  }, [current?.id]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chat?.messages.length, typing]);
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
      setTyping(null);
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
  const nav = [
    { id: "discover", icon: Compass, label: t("nav.discover") },
    { id: "likes", icon: Heart, label: t("nav.likes"), count: received.length },
    {
      id: "messages",
      icon: MessageCircle,
      label: t("nav.messages"),
      count: unread,
    },
    { id: "space", icon: Home, label: t("nav.space") },
  ];

  if (!ready)
    return (
      <div className="app-loading" role="status" aria-label="Loading RoomPair">
        <Brand />
        <span className="loading-line" />
      </div>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand-button"
          onClick={() => changeView("discover")}
          aria-label="RoomPair home"
        >
          <Brand />
        </button>
        <div className="sidebar-section-label">
          {t("A LITTLE MORE AT HOME")}
        </div>
        <nav aria-label="Main navigation">
          {nav.map(({ id, icon: Icon, label, count }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => changeView(id as View)}
            >
              <Icon size={21} strokeWidth={1.7} />
              <span>{label}</span>
              {!!count && <span className="nav-count">{count}</span>}
              {view === id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="chapter-card">
            <span className="tiny-eyebrow">{t("YOUR NEXT CHAPTER")}</span>
            <h3>
              {t("A place is better")}
              <br />
              {t("with your people.")}
            </h3>
            <HomeIllustration />
            <button onClick={() => setOnboarding(true)}>
              {state.onboarded
                ? t("Refine your living style")
                : t("Find your living style")}
              <ArrowUpRight size={17} />
            </button>
          </div>
          <button className="sidebar-help" onClick={() => setDialog("help")}>
            <CircleHelp size={18} />
            {t("A little help")}
          </button>
          <button
            className={`user-button ${view === "profile" ? "selected" : ""}`}
            onClick={() => changeView("profile")}
          >
            <span className="user-avatar">
              {state.preferences.name.charAt(0).toUpperCase()}
            </span>
            <span>
              <strong>{state.preferences.name}</strong>
              <small>{t("View your profile")}</small>
            </span>
            <Settings2 size={17} />
          </button>
          <span className="demo-label">
            <span />
            {t("Student project · Demo community")}
          </span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand small />
          </div>
          <div className="breadcrumb">
            {t("Your people, your place.")}
            <span className="little-sun">✳</span>
          </div>
          <div className="topbar-actions">
            <button className="location-button" onClick={openFilters}>
              <MapPin size={16} />
              {state.preferences.city}
              {state.preferences.city.toLowerCase() === "riga" && (
                <span className="country-name">, Latvia</span>
              )}
              <ChevronDown size={14} />
            </button>
            <span className="topbar-divider" />
            <button
              className="icon-button notification-button"
              aria-label={t("Notifications")}
              onClick={() => {
                setView("likes");
                notify(t("Your newest likes are waiting for you."));
              }}
            >
              <Bell size={20} />
              {received.length > 0 && <i />}
            </button>
            <button
              className="topbar-avatar"
              onClick={() => changeView("profile")}
              aria-label={t("View your profile")}
            >
              {state.preferences.name.charAt(0)}
            </button>
          </div>
        </header>
        <main
          className={`main-content ${view === "messages" ? "main-messages" : ""}`}
        >
          {view === "discover" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="discover-page"
            >
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span />
                    {t("FIND YOUR PEOPLE")}
                  </div>
                  <h1>{t("discover.title")}</h1>
                  <p>{t("discover.subtitle")}</p>
                </div>
                <div className="community-proof">
                  <div className="avatar-stack">
                    {["leo", "sofia", "noah"].map((name) => (
                      <img key={name} src={`/images/${name}.jpg`} alt="" />
                    ))}
                  </div>
                  <span>
                    {ranked.length} {t("people, one new chapter")}
                    <small>{t("Your Riga demo community")}</small>
                  </span>
                </div>
              </div>
              <div className="discover-toolbar">
                <div className="segmented">
                  <button
                    className={mode === "people" ? "selected" : ""}
                    onClick={() => setMode("people")}
                  >
                    <Users size={17} />
                    {t("discover.people")}
                  </button>
                  <button
                    className={mode === "rooms" ? "selected" : ""}
                    onClick={() => setMode("rooms")}
                  >
                    <DoorOpen size={17} />
                    {t("discover.rooms")}
                  </button>
                </div>
                <div className="toolbar-right">
                  <span className="sort-label">
                    {t("Made for your lifestyle")}
                  </span>
                  <button
                    className={`icon-button view-toggle ${listView ? "selected" : ""}`}
                    aria-label={
                      listView
                        ? t("Switch to swipe view")
                        : t("Switch to list view")
                    }
                    onClick={() => setListView(!listView)}
                  >
                    {listView ? (
                      <Compass size={19} />
                    ) : (
                      <ListFilter size={19} />
                    )}
                  </button>
                  <button className="filter-button" onClick={openFilters}>
                    <SlidersHorizontal size={16} />
                    {t("discover.filters")}
                    {activeFilters > 0 && <span>{activeFilters}</span>}
                  </button>
                </div>
              </div>
              {mode === "rooms" ? (
                <>
                  <div className="section-intro">
                    <h2>{t("A space for your next chapter.")}</h2>
                    <p>
                      {t(
                        "Thoughtfully picked demo homes. Save a place and explore it together.",
                      )}
                    </p>
                  </div>
                  <div className="room-grid">
                    {visibleRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        saved={state.savedRooms.includes(room.id)}
                        onSave={() => toggleRoom(room.id)}
                        onOpen={() => {
                          setSelectedRoom(room);
                          setDialog("room");
                        }}
                      />
                    ))}
                    {visibleRooms.length === 0 && (
                      <EmptyState
                        icon={DoorOpen}
                        title={t("No rooms fit your must-haves yet.")}
                        body={t(
                          "Rooms follow your budget, smoking and pet preferences. Adjust them to see more.",
                        )}
                        action={openFilters}
                        label={t("discover.filters")}
                      />
                    )}
                  </div>
                </>
              ) : listView ? (
                <div className="people-grid">
                  {queue.map(({ profile, match }) => (
                    <button
                      key={profile.id}
                      className="person-tile"
                      onClick={() => openProfile(profile)}
                    >
                      <div className="person-tile-image">
                        <img src={profile.photo} alt={profile.name} />
                        <span className="tile-score">
                          <Leaf size={14} />
                          {match.score}% {t("fit")}
                        </span>
                      </div>
                      <h3>
                        {profile.name}, {profile.age}
                        {profile.verified && <BadgeCheck size={18} />}
                      </h3>
                      <p>
                        {profile.occupation} · {profile.neighborhood}
                      </p>
                      <span>
                        €{profile.budget[0]}–{profile.budget[1]} / {t("month")}
                      </span>
                    </button>
                  ))}
                  {queue.length === 0 && (
                    <EmptyState
                      icon={Compass}
                      title={t("A fresh start?")}
                      body={t(
                        "You’ve met everyone who fits your search. Try adjusting your preferences.",
                      )}
                      action={openFilters}
                      label={t("discover.filters")}
                    />
                  )}
                </div>
              ) : (
                <div className="discovery-layout">
                  <section
                    className="swipe-column"
                    aria-label="Roommate discovery"
                  >
                    <div className="card-stage">
                      {current && next && (
                        <div className="back-card">
                          <img src={next.photo} alt="" />
                        </div>
                      )}
                      <AnimatePresence mode="popLayout" custom={direction}>
                        {current ? (
                          <SwipeSurface
                            key={current.id}
                            onDecision={(action) => decide(action, current)}
                          >
                            <img
                              className="profile-photo"
                              src={current.photos[photoIndex] || current.photo}
                              alt={
                                photoIndex === 0
                                  ? `${current.name}, ${current.occupation}`
                                  : t("A look at the home")
                              }
                              draggable="false"
                            />
                            <div className="photo-shade" />
                            <div className="photo-indicators">
                              {current.photos.map((_, i) => (
                                <button
                                  key={i}
                                  className={photoIndex === i ? "active" : ""}
                                  aria-label={`View photo ${i + 1}`}
                                  onClick={() => setPhotoIndex(i)}
                                />
                              ))}
                            </div>
                            <div className="card-topline">
                              <span className="available-pill">
                                <span />
                                {current.intent === "have-room"
                                  ? t("Has a room")
                                  : t("Looking for a room")}
                              </span>
                              <button
                                className="photo-more"
                                aria-label={t("Profile options")}
                                onClick={() => {
                                  setSelected(current);
                                  setDialog("report");
                                }}
                              >
                                <MoreHorizontal size={23} />
                              </button>
                            </div>
                            {current.photos.length > 1 && (
                              <button
                                className="next-photo"
                                aria-label={t("Next photo")}
                                onClick={() =>
                                  setPhotoIndex(
                                    (photoIndex + 1) % current.photos.length,
                                  )
                                }
                              >
                                <ChevronRight size={20} />
                              </button>
                            )}
                            <div className="profile-card-content">
                              <div className="card-location">
                                <MapPin size={13} />
                                {current.neighborhood}, {current.city}
                              </div>
                              <div className="profile-name">
                                <h2>
                                  {current.name}
                                  <span>, {current.age}</span>
                                </h2>
                                {current.verified && (
                                  <BadgeCheck
                                    className="verified-icon"
                                    size={25}
                                  />
                                )}
                                <button
                                  className="profile-expand"
                                  aria-label={`View ${current.name}'s profile`}
                                  onClick={() => openProfile(current)}
                                >
                                  <ArrowUpRight size={22} />
                                </button>
                              </div>
                              <p className="profile-occupation">
                                {current.occupation} <span>·</span>{" "}
                                {t("Moving in")} {dateLabel(current.moveDate)}{" "}
                                <span>·</span> €
                                {current.room?.price || current.budget[1]} /{" "}
                                {t("month")}
                              </p>
                              <p className="profile-bio">{current.bio}</p>
                              <div className="profile-tags">
                                {current.tags.map((tag, i) => (
                                  <span key={tag}>
                                    {i === 0 ? (
                                      <Sprout size={13} />
                                    ) : i === 1 ? (
                                      <Coffee size={13} />
                                    ) : (
                                      <Sparkles size={13} />
                                    )}{" "}
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </SwipeSurface>
                        ) : (
                          <motion.div
                            key="empty"
                            className="no-profiles"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <HomeIllustration />
                            <h2>{t("You’re all caught up.")}</h2>
                            <p>
                              {t(
                                "Good people are worth the wait. Adjust your filters or revisit the people you liked.",
                              )}
                            </p>
                            <button
                              className="button primary"
                              onClick={openFilters}
                            >
                              {t("Adjust my search")}
                              <SlidersHorizontal size={16} />
                            </button>
                            {state.decisions.length > 0 && (
                              <button
                                className="text-button"
                                onClick={() =>
                                  setState((s) => ({ ...s, decisions: [] }))
                                }
                              >
                                {t("Browse everyone again")}
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="swipe-controls">
                      <button
                        className="action undo"
                        disabled={!state.decisions.length}
                        aria-label={t("discover.undo")}
                        title="Undo last swipe"
                        onClick={undo}
                      >
                        <RotateCcw size={21} />
                      </button>
                      <button
                        className="action pass"
                        disabled={!current}
                        aria-label={t("discover.pass")}
                        onClick={() => decide("pass")}
                      >
                        <X size={30} strokeWidth={1.8} />
                      </button>
                      <button
                        className="action like"
                        disabled={!current}
                        aria-label={t("discover.like")}
                        onClick={() => decide("like")}
                      >
                        <Heart size={29} strokeWidth={1.8} />
                      </button>
                      <button
                        className="action info"
                        disabled={!current}
                        aria-label={t("Why you fit")}
                        onClick={() => {
                          setSelected(current!);
                          setDialog("compatibility");
                        }}
                      >
                        <Sparkles size={21} />
                      </button>
                    </div>
                    <div className="swipe-hint">
                      <span>
                        <kbd>←</kbd>
                        {t("Pass")}
                      </span>
                      <span>{t("A good home starts with a hello.")}</span>
                      <span>
                        {t("Like")}
                        <kbd>→</kbd>
                      </span>
                    </div>
                  </section>
                  <aside className="insights-column">
                    {current && match ? (
                      <>
                        <div className="compatibility-card">
                          <div className="compatibility-heading">
                            <span className="eyebrow">
                              {t("THE EVERYDAY KIND OF COMPATIBLE")}
                            </span>
                            <span className="leaf-mark">
                              <Leaf size={20} />
                            </span>
                          </div>
                          <div className="compatibility-score">
                            <strong>
                              {match.score}
                              <span>%</span>
                            </strong>
                            <span>
                              {t("You could live")}
                              <br />
                              {t("well together.")}
                            </span>
                          </div>
                          <p>
                            {t(
                              "It’s the little things that make a home feel right.",
                            )}
                          </p>
                          <div className="compatibility-line" />
                          <ul className="fit-reasons">
                            {match.reasons.slice(0, 3).map((reason, i) => (
                              <li key={reason}>
                                <span>
                                  {i === 0 ? (
                                    <Wallet size={16} />
                                  ) : i === 1 ? (
                                    <Sparkles size={16} />
                                  ) : (
                                    <Sofa size={16} />
                                  )}
                                </span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                          <button
                            className="fit-link"
                            onClick={() => {
                              setSelected(current);
                              setDialog("compatibility");
                            }}
                          >
                            {t("See why you fit")}
                            <ArrowUpRight size={17} />
                          </button>
                        </div>
                        <div className="quick-facts">
                          <div>
                            <span>
                              <Wallet size={16} />
                              {current.intent === "have-room"
                                ? t("The room")
                                : t("Monthly budget")}
                            </span>
                            <strong>
                              {current.room
                                ? `€${current.room.price}`
                                : `€${current.budget[0]}–${current.budget[1]}`}
                              <small> / {t("month")}</small>
                            </strong>
                          </div>
                          <div>
                            <span>
                              <CalendarDays size={16} />
                              {t("Ready to move")}
                            </span>
                            <strong>
                              {dateLabel(current.moveDate)}
                              <small>
                                {" "}
                                · {current.stayMonths} {t("months")}
                              </small>
                            </strong>
                          </div>
                        </div>
                        <div className="prompt-note">
                          <span className="quote-mark">“</span>
                          <span className="tiny-eyebrow">
                            {current.prompt.question}
                          </span>
                          <p>{current.prompt.answer}</p>
                          <span className="note-signature">
                            — {current.name}
                            <svg viewBox="0 0 70 20" fill="none">
                              <path
                                d="M3 14c21-8 34-9 59-8M16 18c16-7 31-5 46-5"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="intent-note">
                          <ShieldCheck size={17} />
                          <p>
                            {t("People first. No pressure.")}
                            <span>
                              {t("Only a mutual like opens a conversation.")}
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="end-note">
                        <HomeIllustration />
                        <h3>{t("Quality over endless swiping.")}</h3>
                        <p>
                          {t(
                            "Your must-haves always come first. We never loosen them just to fill your feed.",
                          )}
                        </p>
                      </div>
                    )}
                  </aside>
                </div>
              )}
              <div className="discover-footer">
                <span>
                  <Leaf size={14} />
                  {t("Built around real life, not just a profile.")}
                </span>
                <button onClick={() => setDialog("help")}>
                  {t("The RoomPair way")}
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {view === "likes" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PageHeading
                eyebrow={t("A LITTLE MUTUAL FEELING")}
                title={t("likes.title")}
                description={t("likes.subtitle")}
              />
              <div className="tabs">
                <button
                  className={likesTab === "received" ? "active" : ""}
                  onClick={() => setLikesTab("received")}
                >
                  {t("likes.received")}
                  <span>{received.length}</span>
                </button>
                <button
                  className={likesTab === "sent" ? "active" : ""}
                  onClick={() => setLikesTab("sent")}
                >
                  {t("likes.sent")}
                  <span>{sent.length}</span>
                </button>
              </div>
              <div className="likes-grid">
                {(likesTab === "received"
                  ? received.map((r) => r.profile)
                  : sent
                ).map((p) => (
                  <div className="like-tile" key={p.id}>
                    <button
                      className="like-photo"
                      onClick={() => openProfile(p)}
                    >
                      <img src={p.photo} alt={p.name} />
                      <span className="tile-score">
                        <Leaf size={14} />
                        {getCompatibility(p, state.preferences).score}%{" "}
                        {t("fit")}
                      </span>
                    </button>
                    <div className="like-info">
                      <h3>
                        {p.name}, {p.age}
                        {p.verified && <BadgeCheck size={18} />}
                      </h3>
                      <p>{p.occupation}</p>
                      <span>
                        <MapPin size={13} />
                        {p.neighborhood}
                      </span>
                      {likesTab === "received" ? (
                        <button
                          className="button primary"
                          onClick={() => decide("like", p)}
                        >
                          <Heart size={17} />
                          {t("Like back")}
                        </button>
                      ) : (
                        <button
                          className="button secondary"
                          onClick={() =>
                            p.likesYou
                              ? openChat(p)
                              : notify(
                                  t(
                                    "Your like is on its way. Chat opens with a mutual match.",
                                  ),
                                )
                          }
                        >
                          {p.likesYou ? (
                            <>
                              <MessageCircle size={17} />
                              {t("Say hello")}
                            </>
                          ) : (
                            <>
                              <Check size={17} />
                              {t("Like sent")}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {(likesTab === "received" ? received : sent).length === 0 && (
                <EmptyState
                  icon={Heart}
                  title={t("Good connections take a little time.")}
                  body={t(
                    "Explore your community and send a like to someone you could see yourself living with.",
                  )}
                  action={() => changeView("discover")}
                  label={t("Meet your people")}
                />
              )}
            </motion.div>
          )}

          {view === "messages" && (
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
              <div
                className={`messenger ${mobileChat ? "show-conversation" : ""}`}
              >
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
                              <small>
                                {c.messages.at(-1)?.time || t("New")}
                              </small>
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
                      {
                        getCompatibility(chatPerson, state.preferences).score
                      }% {t("lifestyle fit")}
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
                            {t(
                              "Skip the small talk. Ask about the little things.",
                            )}
                          </p>
                          {[
                            "What’s your ideal Sunday at home?",
                            "How do you feel about a shared cleaning routine?",
                            "Want to grab a coffee and talk about the room?",
                          ].map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => sendMessage(t(prompt))}
                            >
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
                          {m.sender === "them" && (
                            <img src={chatPerson.photo} alt="" />
                          )}
                          <div className="message-bubble">
                            <p>{m.text}</p>
                            <small>
                              {m.time}
                              {m.sender === "me" && <CheckCheck size={13} />}
                            </small>
                          </div>
                        </div>
                      ))}
                      {typing === chat.id && (
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
                        <small>
                          {t("Save places and plan your move together.")}
                        </small>
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
                      {t(
                        "Demo replies are simulated. No messages leave this device.",
                      )}
                    </span>
                  </section>
                ) : (
                  <EmptyState
                    icon={MessageCircle}
                    title={t("A hello is just a match away.")}
                    body={t(
                      "Like someone back to start your first conversation.",
                    )}
                    action={() => changeView("discover")}
                    label={t("Meet your people")}
                  />
                )}
              </div>
            </motion.div>
          )}

          {view === "space" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-page"
            >
              <PageHeading
                eyebrow={t("THE NEXT CHAPTER, TOGETHER")}
                title={t("space.title")}
                description={t("space.subtitle")}
              />
              <div className="space-banner">
                <div>
                  <span className="eyebrow">{t("YOUR RIGA CHAPTER")}</span>
                  <h2>{t("Let’s make room for real life.")}</h2>
                  <p>
                    <CalendarDays size={16} />
                    {dateLabel(state.preferences.moveDate)}{" "}
                    {state.preferences.moveDate.slice(0, 4)}
                    <span>·</span>€{state.preferences.budgetMin}–
                    {state.preferences.budgetMax} / {t("month")}
                  </p>
                </div>
                <HomeIllustration />
              </div>
              <div className="space-layout">
                <section>
                  <div className="section-header">
                    <h2>
                      {t("Places worth a look")}
                      <span>{savedRooms.length}</span>
                    </h2>
                    <button
                      className="text-button"
                      onClick={() => {
                        setView("discover");
                        setMode("rooms");
                      }}
                    >
                      <Plus size={16} />
                      {t("Add a place")}
                    </button>
                  </div>
                  <div className="saved-rooms">
                    {savedRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        saved
                        onSave={() => toggleRoom(room.id)}
                        onOpen={() => {
                          setSelectedRoom(room);
                          setDialog("room");
                        }}
                      />
                    ))}
                    {savedRooms.length === 0 && (
                      <EmptyState
                        icon={Bookmark}
                        title={t("Room for a favourite.")}
                        body={t(
                          "Save homes from Discover to compare them here.",
                        )}
                        action={() => {
                          setView("discover");
                          setMode("rooms");
                        }}
                        label={t("Explore rooms")}
                      />
                    )}
                  </div>
                  <div className="space-notes">
                    <div className="section-header">
                      <h2>{t("A little shared notebook")}</h2>
                      <span>{t("Saved on this device")}</span>
                    </div>
                    <textarea
                      placeholder={t(
                        "Neighbourhoods you love, questions for a viewing, the coffee table you both want…",
                      )}
                      value={state.notes}
                      onChange={(e) =>
                        setState((s) => ({ ...s, notes: e.target.value }))
                      }
                      aria-label={t("Shared notes")}
                    />
                  </div>
                </section>
                <aside>
                  <div className="checklist-card">
                    <div className="section-header">
                      <h2>{t("Before you move in")}</h2>
                      <span>{state.checklist.length}/5</span>
                    </div>
                    <div className="progress-track">
                      <span
                        style={{ width: `${state.checklist.length * 20}%` }}
                      />
                    </div>
                    <p>{t("Small conversations. A much happier home.")}</p>
                    {[
                      {
                        id: "budget",
                        title: "Talk budgets & shared bills",
                        sub: "Rent, utilities, and the occasional pizza.",
                      },
                      {
                        id: "cleaning",
                        title: "Find your cleaning rhythm",
                        sub: "A little daily, or a Sunday reset?",
                      },
                      {
                        id: "guests",
                        title: "Talk guests & quiet hours",
                        sub: "Make space for everyone’s comfort.",
                      },
                      {
                        id: "viewing",
                        title: "Visit a place together",
                        sub: "See how it feels, in real life.",
                      },
                      {
                        id: "agreement",
                        title: "Write down your house rules",
                        sub: "Shared expectations, fewer surprises.",
                      },
                    ].map((task) => (
                      <button
                        className={`checklist-item ${state.checklist.includes(task.id) ? "checked" : ""}`}
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                      >
                        <span className="checkbox">
                          {state.checklist.includes(task.id) && (
                            <Check size={14} />
                          )}
                        </span>
                        <span>
                          <strong>{t(task.title)}</strong>
                          <small>{t(task.sub)}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="viewing-card">
                    <CalendarDays size={22} />
                    <h3>{t("Put a little plan in place.")}</h3>
                    <label>
                      {t("Your next viewing")}
                      <input
                        type="datetime-local"
                        value={state.viewing}
                        onChange={(e) =>
                          setState((s) => ({ ...s, viewing: e.target.value }))
                        }
                      />
                    </label>
                    {state.viewing && (
                      <p className="success-text">
                        <Check size={14} />
                        {t("Saved to your moving plan.")}
                      </p>
                    )}
                  </div>
                  <p className="space-caption">
                    {t(
                      "A shared-living checklist, not a rental agreement. Demo plans are saved on this device.",
                    )}
                  </p>
                </aside>
              </div>
            </motion.div>
          )}

          {view === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PageHeading
                eyebrow={t("A HOME STARTS WITH YOU")}
                title={t("profile.title")}
                description={t("The little things that make you, you.")}
              />
              <div className="profile-settings-layout">
                <section className="my-profile-card">
                  <div className="profile-cover">
                    <HomeIllustration />
                  </div>
                  <span className="my-avatar">
                    {state.preferences.name.charAt(0)}
                  </span>
                  <h2>{state.preferences.name}</h2>
                  <p>
                    <MapPin size={15} />
                    {state.preferences.city} · {t("Your next chapter")}
                  </p>
                  <div className="profile-intent">
                    <KeyRound size={16} />
                    {state.preferences.intent === "have-room"
                      ? t("I have a room to share")
                      : t("I’m finding my people")}
                  </div>
                  <button
                    className="button primary"
                    onClick={() => setOnboarding(true)}
                  >
                    {t("Edit my profile")}
                    <ArrowUpRight size={17} />
                  </button>
                  <span className="profile-completion">
                    {state.onboarded
                      ? t("Your living style is ready.")
                      : t("Make it yours in a few small steps.")}
                  </span>
                </section>
                <section className="settings-panels">
                  <div className="settings-panel">
                    <div className="section-header">
                      <h2>{t("My living style")}</h2>
                      <button
                        className="text-button"
                        onClick={() => setOnboarding(true)}
                      >
                        {t("common.edit")}
                      </button>
                    </div>
                    <div className="habit-grid">
                      <div>
                        <Wallet />
                        <span>
                          {t("Monthly budget")}
                          <strong>
                            €{state.preferences.budgetMin}–
                            {state.preferences.budgetMax}
                          </strong>
                        </span>
                      </div>
                      <div>
                        <CalendarDays />
                        <span>
                          {t("Ready to move")}
                          <strong>
                            {dateLabel(state.preferences.moveDate)}{" "}
                            {state.preferences.moveDate.slice(0, 4)}
                          </strong>
                        </span>
                      </div>
                      <div>
                        <Sprout />
                        <span>
                          {t("At home")}
                          <strong>
                            {state.preferences.smokeFree
                              ? t("Smoke-free")
                              : t("Open to smoking")}
                          </strong>
                        </span>
                      </div>
                      <div>
                        <Sofa />
                        <span>
                          {t("My rhythm")}
                          <strong>
                            {t(
                              state.preferences.sleep === "early"
                                ? "Early bird"
                                : state.preferences.sleep === "late"
                                  ? "Night owl"
                                  : "A little flexible",
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="settings-panel">
                    <div className="section-header">
                      <h2>{t("settings.language")}</h2>
                      <Globe2 size={20} />
                    </div>
                    <p>{t("Feel at home in your own language.")}</p>
                    <select
                      aria-label={t("settings.language")}
                      value={locale}
                      disabled={languageLoading}
                      onChange={(e) => setLocale(e.target.value)}
                    >
                      {locales.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.nativeName}
                        </option>
                      ))}
                    </select>
                    {languageError && (
                      <p role="alert" className="language-error">
                        {languageError}
                      </p>
                    )}
                  </div>
                  <div className="settings-panel trust-panel">
                    <ShieldCheck size={27} />
                    <div>
                      <h3>{t("Trust is in the details.")}</h3>
                      <p>
                        {t(
                          "Demo student badges illustrate verification. Identity and property checks are not connected in this prototype.",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-button muted"
                    onClick={() => setDialog("settings")}
                  >
                    <Settings2 size={16} />
                    {t("Demo settings & data")}
                  </button>
                </section>
              </div>
            </motion.div>
          )}
        </main>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[
            ...nav,
            { id: "profile", icon: Smile, label: t("nav.profile") },
          ].map(({ id, icon: Icon, label }) => (
            <button
              className={view === id ? "active" : ""}
              key={id}
              onClick={() => changeView(id as View)}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {dialog === "filters" && (
          <Modal title={t("discover.filters")} onClose={() => setDialog(null)}>
            <div className="modal-eyebrow">
              <SlidersHorizontal size={20} />
              {t("A LITTLE MORE YOU")}
            </div>
            <h2>{t("Find your kind of people.")}</h2>
            <p className="modal-description">
              {t("Your must-haves come first. Always.")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (filterDraft.budgetMin >= filterDraft.budgetMax) {
                  notify(t("Your maximum budget must be above your minimum."));
                  return;
                }
                setState((s) => ({
                  ...s,
                  preferences: {
                    ...filterDraft,
                    city: filterDraft.city.trim(),
                  },
                  decisions: s.decisions.filter((d) => d.action === "like"),
                }));
                setDialog(null);
                notify(t("Your search feels a little more like you."));
              }}
              className="filters-form"
            >
              <label>
                {t("City")}
                <input
                  required
                  maxLength={70}
                  value={filterDraft.city}
                  onChange={(e) =>
                    setFilterDraft({ ...filterDraft, city: e.target.value })
                  }
                />
              </label>
              <label>
                {t("I’m here to")}
                <select
                  value={filterDraft.intent}
                  onChange={(e) =>
                    setFilterDraft({
                      ...filterDraft,
                      intent: e.target.value as Preferences["intent"],
                    })
                  }
                >
                  <option value="find-room">
                    {t("Find a room or search together")}
                  </option>
                  <option value="have-room">
                    {t("Find someone for my spare room")}
                  </option>
                  <option value="either">{t("Explore both")}</option>
                </select>
              </label>
              <div className="form-row">
                <label>
                  {t("Monthly budget, from")}
                  <div className="input-currency">
                    <span>€</span>
                    <input
                      type="number"
                      min="100"
                      max="4999"
                      required
                      value={filterDraft.budgetMin}
                      onChange={(e) =>
                        setFilterDraft({
                          ...filterDraft,
                          budgetMin: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </label>
                <label>
                  {t("Up to")}
                  <div className="input-currency">
                    <span>€</span>
                    <input
                      type="number"
                      min="101"
                      max="5000"
                      required
                      value={filterDraft.budgetMax}
                      onChange={(e) =>
                        setFilterDraft({
                          ...filterDraft,
                          budgetMax: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </label>
              </div>
              <div className="form-row">
                <label>
                  {t("Move-in date")}
                  <input
                    type="date"
                    required
                    value={filterDraft.moveDate}
                    onChange={(e) =>
                      setFilterDraft({
                        ...filterDraft,
                        moveDate: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  {t("Stay in months")}
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="1"
                    required
                    value={filterDraft.stayMonths}
                    onChange={(e) =>
                      setFilterDraft({
                        ...filterDraft,
                        stayMonths: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              {[
                {
                  key: "smokeFree",
                  label: "A smoke-free home",
                  sub: "A must-have, not a suggestion.",
                },
                {
                  key: "petsOkay",
                  label: "Pets are welcome",
                  sub: "Room for a four-legged flatmate.",
                },
                {
                  key: "verifiedOnly",
                  label: "Student badge only",
                  sub: "Show demo student-verified profiles.",
                },
              ].map((item) => (
                <label className="toggle-row" key={item.key}>
                  <span>
                    <strong>{t(item.label)}</strong>
                    <small>{t(item.sub)}</small>
                  </span>
                  <input
                    className="switch-input"
                    type="checkbox"
                    checked={
                      filterDraft[item.key as keyof Preferences] as boolean
                    }
                    onChange={(e) =>
                      setFilterDraft({
                        ...filterDraft,
                        [item.key]: e.target.checked,
                      })
                    }
                  />
                </label>
              ))}
              <button type="submit" className="button primary full-width">
                {t("Show my people")}
                <ArrowRight size={18} />
              </button>
            </form>
          </Modal>
        )}
        {dialog === "details" && detail && (
          <Modal
            title={`${detail.name}'s profile`}
            onClose={() => setDialog(null)}
            wide
            className="profile-detail-modal"
          >
            <div className="detail-photo">
              <img src={detail.photo} alt={detail.name} />
              <div>
                <span>
                  {detail.neighborhood}, {detail.city}
                </span>
                <h2>
                  {detail.name}, {detail.age}
                  {detail.verified && <BadgeCheck size={25} />}
                </h2>
                <p>{detail.occupation}</p>
              </div>
            </div>
            <div className="detail-body">
              <div className="detail-intro">
                <span className="green-pill">
                  <Leaf size={14} />
                  {getCompatibility(detail, state.preferences).score}%{" "}
                  {t("lifestyle fit")}
                </span>
                {detail.active && (
                  <span className="small-status">
                    <i />
                    {t("Actively looking")}
                  </span>
                )}
              </div>
              <h3>{t("A little about me")}</h3>
              <p>{detail.bio}</p>
              <div className="detail-facts">
                <span>
                  <Wallet size={18} />€{detail.budget[0]}–{detail.budget[1]} /{" "}
                  {t("month")}
                </span>
                <span>
                  <CalendarDays size={18} />
                  {dateLabel(detail.moveDate)} · {detail.stayMonths}{" "}
                  {t("months")}
                </span>
                <span>
                  <Home size={18} />
                  {detail.intent === "have-room"
                    ? t("Has a room")
                    : t("Looking for a room")}
                </span>
              </div>
              <div className="detail-prompt">
                <small>{detail.prompt.question}</small>
                <p>“{detail.prompt.answer}”</p>
              </div>
              <h3>{t("The everyday things")}</h3>
              <div className="habit-pills">
                <span>
                  {detail.habits.smoking
                    ? t("Smoking indoors")
                    : t("Smoke-free")}
                </span>
                <span>
                  {t(
                    detail.habits.sleep === "early"
                      ? "Early bird"
                      : detail.habits.sleep === "late"
                        ? "Night owl"
                        : "Flexible sleep schedule",
                  )}
                </span>
                <span>
                  {detail.habits.cleanliness >= 4
                    ? t("Keeps things tidy")
                    : t("Relaxed about cleaning")}
                </span>
                {detail.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {detail.room && (
                <div className="detail-room">
                  <img src={detail.room.photo} alt={detail.room.title} />
                  <div>
                    <h3>{detail.room.title}</h3>
                    <p>{detail.room.description}</p>
                    <strong>
                      €{detail.room.price} / {t("month")}
                    </strong>
                  </div>
                </div>
              )}
              <div className="verification-note">
                <ShieldCheck size={18} />
                <span>
                  {detail.verified
                    ? t("Student status: verified in demo.")
                    : t("Student status: not verified.")}
                  <small>
                    {t("Identity and rental authority have not been checked.")}
                  </small>
                </span>
              </div>
              <div className="detail-actions">
                <button
                  className="button secondary"
                  onClick={() => {
                    setSelected(detail);
                    setDialog("compatibility");
                  }}
                >
                  {t("See why you fit")}
                </button>
                {state.chats.some((c) => c.profileId === detail.id) ? (
                  <button
                    className="button primary"
                    onClick={() => openChat(detail)}
                  >
                    <MessageCircle size={17} />
                    {t("Say hello")}
                  </button>
                ) : state.decisions.some(
                    (d) => d.id === detail.id && d.action === "like",
                  ) ? (
                  <button className="button secondary" disabled>
                    <Check size={17} />
                    {t("Like sent")}
                  </button>
                ) : (
                  <button
                    className="button primary"
                    onClick={() => decide("like", detail)}
                  >
                    <Heart size={17} />
                    {t("Send a like")}
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}
        {dialog === "compatibility" && detail && (
          <Modal title={t("Why you fit")} onClose={() => setDialog(null)}>
            <div className="modal-eyebrow">
              <Leaf size={21} />
              {t("THE LITTLE THINGS ADD UP")}
            </div>
            <h2>
              {t("You &")} {detail.name}
            </h2>
            <p className="modal-description">
              {t("A closer look at everyday compatibility.")}
            </p>
            <div className="large-fit-score">
              {getCompatibility(detail, state.preferences).score}
              <span>% {t("lifestyle fit")}</span>
            </div>
            {!getCompatibility(detail, state.preferences).eligible && (
              <div className="consideration">
                <h3>
                  <SlidersHorizontal size={17} />
                  {t("Your search requirements differ")}
                </h3>
                {getCompatibility(detail, state.preferences).dealbreakers.map(
                  (reason) => (
                    <p key={reason}>{reason}</p>
                  ),
                )}
              </div>
            )}
            <div className="breakdown-list">
              {getCompatibility(detail, state.preferences).breakdown.map(
                (item) => (
                  <div key={item.label}>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.score}%</span>
                    </div>
                    <div className="progress-track">
                      <span style={{ width: `${item.score}%` }} />
                    </div>
                    <p>{item.detail}</p>
                  </div>
                ),
              )}
            </div>
            {getCompatibility(detail, state.preferences).considerations.length >
              0 && (
              <div className="consideration">
                <h3>
                  <MessageCircle size={17} />
                  {t("Worth a conversation")}
                </h3>
                {getCompatibility(detail, state.preferences).considerations.map(
                  (c) => (
                    <p key={c}>{c}</p>
                  ),
                )}
              </div>
            )}
            <p className="score-explanation">
              {t(
                "This is a transparent, rule-based comparison of your answers — not a prediction or a guarantee. Budget, location, dates and must-haves are checked before ranking.",
              )}
            </p>
          </Modal>
        )}
        {dialog === "match" && detail && (
          <Modal
            title={t("It’s a RoomPair!")}
            onClose={() => setDialog(null)}
            className="match-modal"
          >
            <div className="match-sprinkles" aria-hidden="true">
              <span>✳</span>
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
            </div>
            <span className="eyebrow">
              {t("GOOD FEELING. MUTUAL FEELING.")}
            </span>
            <div className="match-portraits">
              <span className="match-me">
                {state.preferences.name.charAt(0)}
              </span>
              <span className="match-heart">
                <Heart fill="currentColor" size={22} />
              </span>
              <img src={detail.photo} alt={detail.name} />
            </div>
            <h2>{t("It’s a RoomPair!")}</h2>
            <p>
              {t("You and")} {detail.name}{" "}
              {t("both see a little home in each other.")}
            </p>
            <span className="green-pill">
              <Leaf size={15} />
              {getCompatibility(detail, state.preferences).score}%{" "}
              {t("lifestyle fit")}
            </span>
            <button
              className="button primary full-width"
              onClick={() => openChat(detail)}
            >
              {t("Say a little hello")}
              <MessageCircle size={18} />
            </button>
            <button className="text-button" onClick={() => setDialog(null)}>
              {t("Keep exploring")}
            </button>
          </Modal>
        )}
        {dialog === "room" && selectedRoom && (
          <Modal
            title={selectedRoom.title}
            onClose={() => setDialog(null)}
            wide
            className="room-detail-modal"
          >
            <img
              className="room-detail-photo"
              src={selectedRoom.photo}
              alt={selectedRoom.title}
            />
            <div className="room-detail-body">
              <span className="eyebrow">
                <MapPin size={14} />
                {selectedRoom.neighborhood}, {selectedRoom.city}
              </span>
              <h2>{selectedRoom.title}</h2>
              <strong className="room-detail-price">
                €{selectedRoom.price}
                <small> / {t("month")}</small>
              </strong>
              <p>{selectedRoom.description}</p>
              <div className="habit-pills">
                {selectedRoom.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="verification-note">
                <ShieldCheck size={18} />
                {t(
                  "Fictional demo listing. Property and rental authority are not verified.",
                )}
              </p>
              <button
                className="button primary"
                onClick={() => {
                  toggleRoom(selectedRoom.id);
                  notify(
                    state.savedRooms.includes(selectedRoom.id)
                      ? t("Removed from your shared space.")
                      : t("Saved. One step closer to your next chapter."),
                  );
                }}
              >
                <Bookmark
                  size={17}
                  fill={
                    state.savedRooms.includes(selectedRoom.id)
                      ? "currentColor"
                      : "none"
                  }
                />
                {state.savedRooms.includes(selectedRoom.id)
                  ? t("Saved to our space")
                  : t("Save to our space")}
              </button>
            </div>
          </Modal>
        )}
        {dialog === "help" && (
          <Modal title={t("The RoomPair way")} onClose={() => setDialog(null)}>
            <Brand />
            <HomeIllustration />
            <h2>{t("Find your people. Then your place.")}</h2>
            <p className="modal-description">
              {t(
                "A good roommate is more than a good profile. RoomPair puts everyday life at the heart of finding a home.",
              )}
            </p>
            <div className="help-steps">
              <p>
                <span>01</span>
                <strong>{t("Your must-haves, respected.")}</strong>
                {t(
                  "Budget, moving dates and dealbreakers come before the score.",
                )}
              </p>
              <p>
                <span>02</span>
                <strong>{t("A feeling that goes both ways.")}</strong>
                {t(
                  "Like, match, and have a real conversation. No pressure, no paywall.",
                )}
              </p>
              <p>
                <span>03</span>
                <strong>{t("From a match to a moving plan.")}</strong>
                {t("Save places, talk house rules, and plan your new chapter.")}
              </p>
            </div>
            <p className="demo-disclosure">
              {t(
                "This is a school-project prototype. People, listings, student badges and replies are fictional demonstrations. Your changes stay in this browser.",
              )}
            </p>
            <button
              className="button primary full-width"
              onClick={() => {
                setDialog(null);
                setOnboarding(true);
              }}
            >
              {t("Make RoomPair yours")}
              <ArrowRight size={17} />
            </button>
          </Modal>
        )}
        {dialog === "settings" && (
          <Modal
            title={t("Demo settings & data")}
            onClose={() => setDialog(null)}
          >
            <div className="modal-eyebrow">
              <Settings2 size={20} />
              {t("YOUR ROOMPAIR")}
            </div>
            <h2>{t("A fresh page, anytime.")}</h2>
            <p className="modal-description">
              {t(
                "Reset the demo to restore sample conversations, likes, and preferences. This only clears RoomPair data in this browser.",
              )}
            </p>
            <button
              className="button secondary full-width"
              onClick={() => {
                replyTimers.current.forEach(clearTimeout);
                setTyping(null);
                reset();
                setDialog(null);
                setView("discover");
                setMode("people");
                setListView(false);
                notify(t("Your demo is ready for a new beginning."));
              }}
            >
              <RotateCcw size={17} />
              {t("Reset demo data")}
            </button>
            <button className="text-button" onClick={() => setDialog(null)}>
              {t("common.cancel")}
            </button>
          </Modal>
        )}
        {dialog === "report" && detail && (
          <Modal title={t("Profile options")} onClose={() => setDialog(null)}>
            <div className="modal-eyebrow">
              <ShieldCheck size={20} />
              {t("YOUR COMFORT COMES FIRST")}
            </div>
            <h2>{t("A little more peace of mind.")}</h2>
            <p className="modal-description">
              {t("You’re in control of who you connect with.")}
            </p>
            <label className="report-label">
              {t("Reason for reporting")}
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                {[
                  "Misleading profile",
                  "Inappropriate messages",
                  "Suspicious listing",
                  "Something else",
                ].map((r) => (
                  <option key={r} value={r}>
                    {t(r)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button secondary full-width"
              onClick={() => {
                setState((s) => ({
                  ...s,
                  reports: [
                    ...s.reports,
                    { profileId: detail.id, reason: reportReason },
                  ],
                }));
                setDialog(null);
                notify(
                  t(
                    "Demo report saved locally. No moderation service is connected.",
                  ),
                );
              }}
            >
              {t("Save a demo report")}
            </button>
            <button
              className="button danger full-width"
              onClick={() => {
                setState((s) => ({
                  ...s,
                  blocked: [...s.blocked, detail.id],
                  chats: s.chats.filter((c) => c.profileId !== detail.id),
                }));
                setDialog(null);
                notify(t("Profile blocked and conversation removed."));
              }}
            >
              {t("Block")} {detail.name}
            </button>
          </Modal>
        )}
      </AnimatePresence>
      {onboarding && (
        <Onboarding
          initial={state.preferences}
          onClose={() => setOnboarding(false)}
          onComplete={(preferences) => {
            setState((s) => ({
              ...s,
              preferences,
              onboarded: true,
              decisions: s.decisions.filter((d) => d.action === "like"),
            }));
            setOnboarding(false);
            setView("discover");
            notify(
              t("Welcome to your next chapter,") + " " + preferences.name + ".",
            );
          }}
        />
      )}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Check size={17} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
function RoomCard({
  room,
  saved,
  onSave,
  onOpen,
}: {
  room: Room;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const { t } = useI18n();
  return (
    <article className="room-card">
      <div className="room-card-image">
        <button onClick={onOpen} aria-label={`View ${room.title}`}>
          <img src={room.photo} alt={room.title} />
        </button>
        <span className="room-type">
          <DoorOpen size={13} />
          {t("Private room")}
        </span>
        <button
          className={`bookmark-button ${saved ? "saved" : ""}`}
          onClick={onSave}
          aria-label={saved ? t("Unsave room") : t("Save room")}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="room-card-body">
        <span className="room-location">
          <MapPin size={13} />
          {room.neighborhood}, {room.city}
        </span>
        <button className="room-title-button" onClick={onOpen}>
          <h3>{room.title}</h3>
          <ArrowUpRight size={18} />
        </button>
        <div className="room-tags">
          {room.tags.slice(0, 2).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="room-price">
          <strong>
            €{room.price}
            <small> / {t("month")}</small>
          </strong>
          <button className="text-button" onClick={onOpen}>
            {t("Take a look")}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
