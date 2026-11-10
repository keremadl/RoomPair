"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { STORAGE_KEY } from "@/lib/store";

/**
 * Last-resort fallback. It renders outside the app's language provider, so the
 * copy stays in English. Resetting clears only RoomPair's own browser data.
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
  return (
    <main className="empty-state" role="alert">
      <h2>Something went wrong.</h2>
      <p>
        RoomPair hit an unexpected problem. Try again, or reset the demo data
        stored in this browser.
      </p>
      <button className="button primary" onClick={() => retry()}>
        Try again
      </button>
      <button
        className="text-button"
        onClick={() => {
          try {
            localStorage.removeItem(STORAGE_KEY);
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
