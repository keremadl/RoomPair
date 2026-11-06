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
import { Toast, TopBar } from "@/design-system";
import {
  defaultLanguage,
  directionFontVariables,
} from "@/design-system/languages";
import { useI18n } from "@/lib/i18n";
import { Brand } from "./Brand";
import s from "./AppShell.module.css";

export type View = "discover" | "likes" | "messages" | "space" | "profile";

/**
 * The app frame: the top bar (page title, or back + title on a sub-page,
 * and the page's icons), sidebar on wide screens, tab bar on phones.
 * The design language (Card) comes from data-direction; everything inside
 * reads its tokens.
 */
export function AppShell({
  view,
  onNavigate,
  counts,
  onHelp,
  toast,
  title,
  actions,
  onBack,
  children,
}: {
  view: View;
  onNavigate: (view: View) => void;
  counts: { likes: number; messages: number };
  onHelp: () => void;
  toast: string;
  /** The page title, shown in the top bar. */
  title: string;
  /** The page's icon buttons, at the top right. */
  actions?: ReactNode;
  /** Set on a sub-page: shows a back button before the title. */
  onBack?: () => void;
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
      <TopBar
        title={title}
        actions={actions}
        onBack={onBack}
        backLabel={t("Back")}
      />

      <div className={s.body}>
        <aside className={s.sidebar}>
          <button
            type="button"
            className={s.brandButton}
            onClick={() => onNavigate("discover")}
            aria-label={t("RoomPair home")}
          >
            <Brand />
          </button>
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
