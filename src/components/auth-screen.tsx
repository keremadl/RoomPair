"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Account } from "@/lib/app-data";
import { useI18n } from "@/lib/i18n";
import { Brand, HomeIllustration } from "./ui";

const MIN_PASSWORD = 8;

/** Sign in or create an account. Shown instead of the app while signed out. */
export function AuthScreen({ account }: { account: Account }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit() {
    setError("");
    setNotice("");
    if (mode === "sign-up" && password.length < MIN_PASSWORD) {
      setError(t("auth.error.password", { count: MIN_PASSWORD }));
      return;
    }
    setBusy(true);
    try {
      if (mode === "sign-in") {
        if (!(await account.signIn(email.trim(), password)))
          setError(t("auth.error.signIn"));
        return;
      }
      const result = await account.signUp(name.trim(), email.trim(), password);
      if (result === "confirm-email") {
        setNotice(t("auth.confirmEmail"));
        setMode("sign-in");
        setPassword("");
      } else if (result === "exists") setError(t("auth.error.exists"));
      else if (result === "failed") setError(t("auth.error.generic"));
    } catch {
      setError(t("auth.error.generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <Brand />
        <HomeIllustration />
        <h1>{t(mode === "sign-in" ? "auth.welcomeBack" : "auth.join")}</h1>
        <p className="auth-intro">{t("auth.intro")}</p>
        <form
          className="filters-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {mode === "sign-up" && (
            <label>
              {t("auth.name")}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="given-name"
                maxLength={48}
                required
              />
            </label>
          )}
          <label>
            {t("auth.email")}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          <label>
            {t("auth.password")}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              minLength={mode === "sign-up" ? MIN_PASSWORD : undefined}
              maxLength={72}
              required
            />
          </label>
          {error && (
            <p className="auth-message auth-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="auth-message" role="status">
              {notice}
            </p>
          )}
          <button
            type="submit"
            className="button primary full-width"
            disabled={busy}
          >
            {t(mode === "sign-in" ? "auth.signIn" : "auth.signUp")}
            <ArrowRight size={18} />
          </button>
        </form>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setError("");
            setNotice("");
          }}
        >
          {t(mode === "sign-in" ? "auth.toSignUp" : "auth.toSignIn")}
        </button>
        <p className="auth-footnote">{t("auth.footnote")}</p>
      </section>
    </main>
  );
}
