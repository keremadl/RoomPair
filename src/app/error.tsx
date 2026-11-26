"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { BACKUP_KEY, STORAGE_KEY } from "@/lib/store";

/**
 * Last-resort fallback when a page throws while rendering. It sits outside
 * the app's language provider and design-system context, so it uses plain
 * tokens and English copy. Resetting clears only RoomPair's own saved data.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const button = {
    font: "inherit",
    padding: "var(--space-3, 12px) var(--space-5, 20px)",
    borderRadius: "var(--radius-pill, 999px)",
    border: "2px solid var(--color-border-strong, currentColor)",
    background: "var(--color-surface, transparent)",
    color: "inherit",
    cursor: "pointer",
  } as const;
  return (
    <main
      role="alert"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
        gap: "var(--space-4, 16px)",
        padding: "var(--space-5, 20px)",
        textAlign: "center",
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <h1 style={{ margin: 0 }}>Something went wrong.</h1>
      <p style={{ margin: 0, maxWidth: "36ch" }}>
        RoomPair hit an unexpected problem. Try again, or reset the demo data
        saved in this browser.
      </p>
      <button style={button} onClick={() => retry()}>
        Try again
      </button>
      <button
        style={button}
        onClick={() => {
          try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(BACKUP_KEY);
          } catch {
            /* Storage is unavailable; reloading is still the best option. */
          }
          window.location.reload();
        }}
      >
        Reset demo data
      </button>
    </main>
  );
}
