"use client";
import type { CSSProperties, ReactNode } from "react";
import {
  Bell,
  CircleHelp,
  Compass,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Smile,
} from "lucide-react";
import { Toast } from "@/design-system";
import {
  defaultLanguage,
  directionFontVariables,
} from "@/design-system/languages";
import { useI18n } from "@/lib/i18n";
import { Brand } from "./Brand";
import s from "./AppShell.module.css";

export type View = "discover" | "likes" | "messages" | "space" | "profile";

/**
 * The app frame: top bar, sidebar on wide screens, tab bar on phones.
 * The design language (Card) comes from data-direction; everything inside
 * reads its tokens.
 */
export function AppShell({
  view,
  onNavigate,
  counts,
  userName,
  onHelp,
  onNotifications,
  toast,
  barAction,
  children,
}: {
  view: View;
  onNavigate: (view: View) => void;
  counts: { likes: number; messages: number };
  userName: string;
  onHelp: () => void;
  onNotifications: () => void;
  toast: string;
  /** The page's own action at the top right, in place of the profile button. */
  barAction?: { label: string; icon: ReactNode; onClick: () => void };
  children: ReactNode;
}) {
  const { t } = useI18n();
  const nav: {
    id: View;
    label: string;
    icon: typeof Compass;
    count?: number;
  }[] = [
    { id: "discover", label: t("nav.discover"), icon: Compass },
    { id: "likes", label: t("nav.likes"), icon: Heart, count: counts.likes },
    {
      id: "messages",
      label: t("nav.messages"),
      icon: MessageCircle,
      count: counts.messages,
    },
    { id: "space", label: t("nav.space"), icon: Home },
    { id: "profile", label: t("nav.profile"), icon: Smile },
  ];
  return (
    <div
      className={`${s.app} ${directionFontVariables}`}
      data-direction={defaultLanguage}
      style={{ "--sticky-offset": "var(--shell-bar-height)" } as CSSProperties}
    >
      <a href="#main" className={s.skip}>
        {t("Skip to content")}
      </a>
      <header className={s.bar}>
        <button
          type="button"
          className={s.brandButton}
          onClick={() => onNavigate("discover")}
          aria-label={t("RoomPair home")}
        >
          <Brand />
        </button>
        <span className={s.city}>
          <MapPin aria-hidden="true" />
          {t("header.location")}
        </span>
        <div className={s.barEnd}>
          <button
            type="button"
            className={s.barIcon}
            aria-label={t("Notifications")}
            onClick={onNotifications}
          >
            <Bell aria-hidden="true" />
            {counts.likes > 0 && <span className={s.dot} />}
          </button>
          {barAction ? (
            <button
              type="button"
              className={s.barAction}
              aria-label={barAction.label}
              onClick={barAction.onClick}
            >
              {barAction.icon}
            </button>
          ) : (
            <button
              type="button"
              className={s.avatar}
              aria-label={t("View your profile")}
              aria-current={view === "profile" ? "page" : undefined}
              onClick={() => onNavigate("profile")}
            >
              {userName.charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </header>

      <div className={s.body}>
        <aside className={s.sidebar}>
          <nav aria-label={t("Main navigation")} className={s.sideNav}>
            {nav.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                type="button"
                className={s.sideItem}
                aria-current={view === id ? "page" : undefined}
                onClick={() => onNavigate(id)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
                {!!count && <span className={s.count}>{count}</span>}
              </button>
            ))}
          </nav>
          <button type="button" className={s.help} onClick={onHelp}>
            <CircleHelp aria-hidden="true" />
            {t("Help")}
          </button>
        </aside>
        <main id="main" className={s.main} tabIndex={-1}>
          {children}
        </main>
      </div>

      <nav aria-label={t("Mobile navigation")} className={s.tabbar}>
        {nav.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            className={s.tab}
            aria-current={view === id ? "page" : undefined}
            onClick={() => onNavigate(id)}
          >
            <span className={s.tabIcon}>
              <Icon aria-hidden="true" />
              {!!count && <span className={s.tabCount}>{count}</span>}
            </span>
            {label}
          </button>
        ))}
      </nav>
      <Toast message={toast} />
    </div>
  );
}
