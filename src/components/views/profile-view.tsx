"use client";

import {
  ArrowUpRight,
  CalendarDays,
  Globe2,
  KeyRound,
  MapPin,
  Settings2,
  ShieldCheck,
  Sofa,
  Sprout,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { HomeIllustration } from "../ui";
import { PageHeading } from "../shared";
import { useApp } from "../app/controller";

export function ProfileView() {
  const {
    t,
    locale,
    setLocale,
    locales,
    languageLoading,
    languageError,
    state,
    dateLabel,
    setDialog,
    setOnboarding,
  } = useApp();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
          <span className="my-avatar">{state.preferences.name.charAt(0)}</span>
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
                    €{state.preferences.budgetMin}–{state.preferences.budgetMax}
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
  );
}
