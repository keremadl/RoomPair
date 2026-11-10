"use client";
import { useState } from "react";
import {
  Button,
  Heading,
  Input,
  Switch,
  Text,
  TextLink,
} from "@/design-system";
import {
  defaultLanguage,
  directionFontVariables,
} from "@/design-system/languages";
import type { Account } from "@/lib/app-data";
import { useI18n } from "@/lib/i18n";
import { Brand } from "./Brand";
import s from "./AuthScreen.module.css";

const MIN_PASSWORD = 8;

/**
 * Sign in or create an account. Shown instead of the app while signed out,
 * so it carries the design language, palette and theme itself: the app shell
 * that normally sets them is not on screen.
 */
export function AuthScreen({
  account,
  palette,
  theme,
}: {
  account: Account;
  palette: string;
  theme: "light" | "dark";
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const signingUp = mode === "sign-up";

  async function submit() {
    setError("");
    setNotice("");
    if (signingUp && password.length < MIN_PASSWORD) {
      setError(
        t("Use a password with at least {count} characters.", {
          count: MIN_PASSWORD,
        }),
      );
      return;
    }
    if (signingUp && !agreed) {
      setError(
        t("Please confirm that you are 18 or older and accept the notice."),
      );
      return;
    }
    setBusy(true);
    try {
      if (!signingUp) {
        if (!(await account.signIn(email.trim(), password)))
          setError(t("That email and password do not match an account."));
        return;
      }
      const result = await account.signUp(name.trim(), email.trim(), password);
      if (result === "confirm-email") {
        setNotice(
          t("Almost there. Open the link we emailed you, then sign in."),
        );
        setMode("sign-in");
        setPassword("");
      } else if (result === "exists")
        setError(
          t("An account with this email already exists. Try signing in."),
        );
      else if (result === "failed")
        setError(t("Something went wrong. Please try again in a moment."));
    } catch {
      setError(t("Something went wrong. Please try again in a moment."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className={`${s.page} ${directionFontVariables}`}
      data-direction={defaultLanguage}
      data-palette={palette}
      data-theme={theme}
    >
      <section className={s.card}>
        <Brand />
        <Heading level={1}>
          {signingUp ? t("Create your account") : t("Welcome back")}
        </Heading>
        <Text tone="muted">
          {t("Sign in to meet people you could share a home with.")}
        </Text>
        <form
          className={s.form}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {signingUp && (
            <Input
              label={t("Your first name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="given-name"
              maxLength={48}
              required
            />
          )}
          <Input
            label={t("Email")}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            maxLength={254}
            required
          />
          <Input
            label={t("Password")}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={signingUp ? "new-password" : "current-password"}
            maxLength={72}
            required
          />
          {signingUp && (
            <>
              <Switch
                label={t("I am 18 or older and I accept the privacy notice")}
                checked={agreed}
                onChange={setAgreed}
              />
              <Text tone="muted" size="sm">
                <TextLink href="/privacy" target="_blank" rel="noreferrer">
                  {t("Read the privacy notice")}
                </TextLink>
              </Text>
            </>
          )}
          {error && (
            <Text tone="danger" role="alert">
              {error}
            </Text>
          )}
          {notice && <Text role="status">{notice}</Text>}
          <Button type="submit" fullWidth disabled={busy}>
            {signingUp ? t("Create my account") : t("Sign in")}
          </Button>
        </form>
        <Button
          variant="ghost"
          onClick={() => {
            setMode(signingUp ? "sign-in" : "sign-up");
            setError("");
            setNotice("");
          }}
        >
          {signingUp
            ? t("Already have an account? Sign in")
            : t("New here? Create an account")}
        </Button>
        <Text tone="muted" size="sm">
          {t("Student project. Demo members are fictional and do not reply.")}
        </Text>
      </section>
    </main>
  );
}
