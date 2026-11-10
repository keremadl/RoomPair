"use client";

import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Settings2,
  Smile,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { I18nProvider } from "@/lib/i18n";
import { AppProvider, useApp, type View } from "./app/controller";
import { DiscoverView } from "./views/discover-view";
import { LikesView } from "./views/likes-view";
import { MessagesView } from "./views/messages-view";
import { SpaceView } from "./views/space-view";
import { ProfileView } from "./views/profile-view";
import { FiltersDialog } from "./dialogs/filters-dialog";
import { DetailsDialog } from "./dialogs/details-dialog";
import { CompatibilityDialog } from "./dialogs/compatibility-dialog";
import { MatchDialog } from "./dialogs/match-dialog";
import { RoomDialog } from "./dialogs/room-dialog";
import { HelpDialog } from "./dialogs/help-dialog";
import { SettingsDialog } from "./dialogs/settings-dialog";
import { ReportDialog } from "./dialogs/report-dialog";
import { AuthScreen } from "./auth-screen";
import { Onboarding } from "./onboarding";
import { Brand, HomeIllustration } from "./ui";

/** Providers plus the frame around the pages: sidebar, top bar, navigation, dialogs. */
export default function RoomPair() {
  return (
    <I18nProvider>
      <MotionConfig reducedMotion="user">
        <AppProvider>
          <Shell />
        </AppProvider>
      </MotionConfig>
    </I18nProvider>
  );
}

function Shell() {
  const {
    t,
    state,
    setState,
    ready,
    saveFailed,
    account,
    view,
    setView,
    dialog,
    setDialog,
    onboarding,
    setOnboarding,
    selectedRoom,
    toast,
    detail,
    received,
    unread,
    notify,
    changeView,
    openFilters,
  } = useApp();
  // A new member answers the living-style questions before anything else;
  // until then nobody else can see them. They may still skip and look around.
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);
  const mustOnboard =
    account?.status === "signed-in" &&
    ready &&
    !state.onboarded &&
    !onboardingSkipped;
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
      <div
        className="app-loading"
        role="status"
        aria-label={t("Loading RoomPair")}
      >
        <Brand />
        <span className="loading-line" />
      </div>
    );
  if (account?.status === "signed-out") return <AuthScreen account={account} />;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand-button"
          onClick={() => changeView("discover")}
          aria-label={t("RoomPair home")}
        >
          <Brand />
        </button>
        <div className="sidebar-section-label">
          {t("A LITTLE MORE AT HOME")}
        </div>
        <nav aria-label={t("Main navigation")}>
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
                <span className="country-name">, {t("Latvia")}</span>
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
        {saveFailed && (
          <p className="storage-warning" role="status">
            {account
              ? t("sync.failed")
              : t(
                  "Changes can’t be saved in this browser. They will last until you close this tab.",
                )}
          </p>
        )}
        <main
          className={`main-content ${view === "messages" ? "main-messages" : ""}`}
        >
          {view === "discover" && <DiscoverView />}
          {view === "likes" && <LikesView />}
          {view === "messages" && <MessagesView />}
          {view === "space" && <SpaceView />}
          {view === "profile" && <ProfileView />}
        </main>
        <nav className="mobile-nav" aria-label={t("Mobile navigation")}>
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
        {dialog === "filters" && <FiltersDialog />}
        {dialog === "details" && detail && <DetailsDialog detail={detail} />}
        {dialog === "compatibility" && detail && (
          <CompatibilityDialog detail={detail} />
        )}
        {dialog === "match" && detail && <MatchDialog detail={detail} />}
        {dialog === "room" && selectedRoom && (
          <RoomDialog selectedRoom={selectedRoom} />
        )}
        {dialog === "help" && <HelpDialog />}
        {dialog === "settings" && <SettingsDialog />}
        {dialog === "report" && detail && <ReportDialog detail={detail} />}
      </AnimatePresence>
      {(onboarding || mustOnboard) && (
        <Onboarding
          initial={state.preferences}
          onClose={() => {
            setOnboarding(false);
            setOnboardingSkipped(true);
          }}
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
              t("Welcome to your next chapter, {name}.", {
                name: preferences.name,
              }),
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
