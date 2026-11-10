"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { profiles as demoProfiles } from "./data";
import { initialState, useAppState, type AppState } from "./store";
import type { Profile } from "./types";
import { getClient, isRemote } from "./backend/client";
import { appDataFromSnapshot, type AppData } from "./backend/mapping";
import {
  applyOperation,
  deleteAccount,
  loadModeration,
  loadSnapshot,
  photoUrls,
  reviewReport,
  type ReportRow,
} from "./backend/remote";
import { diffState, enqueue, type Operation } from "./backend/sync";

export type SignUpResult = "signed-in" | "confirm-email" | "exists" | "failed";
export interface Account {
  status: "signed-out" | "signed-in";
  email: string;
  /** Resolves to false when the email or password was not accepted. */
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<SignUpResult>;
  signOut: () => void;
  /** Removes the account and everything in it. Resolves to false if it failed. */
  deleteAccount: () => Promise<boolean>;
}

/** A report waiting for, or closed by, a moderator. */
export type ReviewItem = ReportRow;
export interface Moderation {
  reports: ReviewItem[];
  /** Closes a report; `suspend` also hides the reported member. False if it failed. */
  review: (
    report: string,
    outcome: "reviewed" | "dismissed",
    suspend: boolean,
  ) => Promise<boolean>;
}

/** What the interface needs, whichever place the data lives in. */
export interface AppDataSource {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  /** False until the first load finished; the interface shows a loader. */
  ready: boolean;
  /** The last save did not reach its destination. */
  saveFailed: boolean;
  profiles: Profile[];
  /** Null in the browser-only demo, which has no accounts. */
  account: Account | null;
  /** Present only for signed-in moderators. */
  moderation: Moderation | null;
  /** Demo people answer with canned replies; real members answer for themselves. */
  simulatesReplies: boolean;
  reset: () => void;
}

/** The self-contained demo: fictional people, state kept in this browser. */
function useLocalData(): AppDataSource {
  const { state, setState, ready, reset, saveFailed } = useAppState();
  return {
    state,
    setState,
    ready,
    saveFailed,
    profiles: demoProfiles,
    account: null,
    moderation: null,
    simulatesReplies: true,
    reset,
  };
}

const emptyData: AppData = {
  state: initialState,
  profiles: [],
  matchIds: {},
};
// Messages and matches are pushed live; this slower check catches the rest
// (new likes) and anything missed while the connection was down.
const POLL_INTERVAL = 15000;

/**
 * Accounts and shared data. The interface keeps editing its state
 * optimistically; each edit is turned into writes (see backend/sync.ts), sent
 * one after another, and followed by a fresh read so the screen ends up
 * showing what the database decided, for example a new match.
 */
function useRemoteData(): AppDataSource {
  const client = getClient();
  // undefined: still checking for a stored session.
  const [user, setUser] = useState<
    { id: string; email: string } | null | undefined
  >(undefined);
  const [data, setData] = useState<AppData>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [reports, setReports] = useState<ReviewItem[] | null>(null);
  const current = useRef(data);
  const userId = useRef<string | null>(null);
  const queue = useRef<Operation[]>([]);
  const sending = useRef(false);
  // Counts local edits, so a read that started before an edit is discarded.
  const edits = useRef(0);

  const refresh = useCallback(async () => {
    const id = userId.current;
    if (!id) return;
    const startedAt = edits.current;
    try {
      const snapshot = await loadSnapshot(client, id);
      const next = appDataFromSnapshot(
        snapshot,
        await photoUrls(client, snapshot),
      );
      // A room is only published once it has a title. Until then the listing
      // exists only on this device, and a fresh read must not wipe the draft.
      if (!snapshot.rooms.some((room) => room.owner_id === id))
        next.state.me.room = current.current.state.me.room;
      if (
        userId.current !== id ||
        edits.current !== startedAt ||
        sending.current ||
        queue.current.length
      )
        return;
      current.current = next;
      setData(next);
      setLoaded(true);
    } catch {
      setSaveFailed(true);
    }
  }, [client]);

  const send = useCallback(async () => {
    if (sending.current || !userId.current) return;
    sending.current = true;
    let failed = false;
    while (queue.current.length) {
      const [operation, ...rest] = queue.current;
      queue.current = rest;
      try {
        await applyOperation(
          client,
          userId.current,
          operation,
          current.current.matchIds,
        );
      } catch {
        failed = true;
      }
    }
    sending.current = false;
    setSaveFailed(failed);
    // Rejected edits disappear here: the screen returns to the server's truth.
    void refresh();
  }, [client, refresh]);

  const setState = useCallback<Dispatch<SetStateAction<AppState>>>(
    (update) => {
      const previous = current.current.state;
      const next = typeof update === "function" ? update(previous) : update;
      if (next === previous) return;
      edits.current += 1;
      current.current = { ...current.current, state: next };
      setData(current.current);
      queue.current = enqueue(queue.current, diffState(previous, next));
      void send();
    },
    [send],
  );

  useEffect(() => {
    const apply = (sessionUser: { id: string; email?: string } | null) => {
      const next = sessionUser
        ? { id: sessionUser.id, email: sessionUser.email ?? "" }
        : null;
      if (userId.current === (next?.id ?? null) && userId.current) return;
      userId.current = next?.id ?? null;
      queue.current = [];
      current.current = emptyData;
      setData(emptyData);
      setLoaded(false);
      setSaveFailed(false);
      setUser(next);
      // The auth client must not be called from inside its own callback.
      if (next) setTimeout(() => void refresh(), 0);
    };
    void client.auth
      .getSession()
      .then(({ data: { session } }) => apply(session?.user ?? null));
    const { data: listener } = client.auth.onAuthStateChange(
      (_event, session) => apply(session?.user ?? null),
    );
    return () => listener.subscription.unsubscribe();
  }, [client, refresh]);

  // New messages and matches are pushed by the database the moment they
  // happen; a slower check while the tab is open covers everything else.
  useEffect(() => {
    if (!user) return;
    const idle = () => !sending.current && !queue.current.length;
    let wake: ReturnType<typeof setTimeout> | undefined;
    const changed = () => {
      clearTimeout(wake);
      // A burst of changes (a match and its first message) is read once.
      wake = setTimeout(() => {
        if (idle()) void refresh();
      }, 150);
    };
    const channel = client
      .channel(`member-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        changed,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        changed,
      )
      .subscribe();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && idle()) void refresh();
    }, POLL_INTERVAL);
    return () => {
      clearTimeout(wake);
      clearInterval(timer);
      void client.removeChannel(channel);
    };
  }, [client, user, refresh]);

  // Moderators get the review queue once after signing in, and after each review.
  const loadReports = useCallback(async () => {
    try {
      setReports(await loadModeration(client));
    } catch {
      setReports(null);
    }
  }, [client]);
  useEffect(() => {
    if (user) void loadReports();
    else setReports(null);
  }, [user, loadReports]);
  const moderation = useMemo<Moderation | null>(
    () =>
      reports && {
        reports,
        review: async (report, outcome, suspend) => {
          try {
            await reviewReport(client, report, outcome, suspend);
          } catch {
            return false;
          }
          await loadReports();
          // A hidden member disappears from this moderator's own lists too.
          void refresh();
          return true;
        },
      },
    [client, reports, loadReports, refresh],
  );

  const account = useMemo<Account>(
    () => ({
      status: user ? "signed-in" : "signed-out",
      email: user?.email ?? "",
      signIn: async (email, password) => {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        return !error;
      },
      signUp: async (name, email, password) => {
        const { data: result, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error)
          return /already|registered|exists/i.test(error.message)
            ? "exists"
            : "failed";
        return result.session ? "signed-in" : "confirm-email";
      },
      signOut: () => void client.auth.signOut(),
      deleteAccount: async () => {
        if (!user) return false;
        try {
          await deleteAccount(
            client,
            user.id,
            Object.values(current.current.matchIds),
          );
        } catch {
          return false;
        }
        // The account is gone, so only this device's session is left to clear.
        await client.auth.signOut({ scope: "local" });
        return true;
      },
    }),
    [client, user],
  );

  return {
    state: data.state,
    setState,
    ready: user === null || (user !== undefined && loaded),
    saveFailed,
    profiles: data.profiles,
    account,
    moderation,
    simulatesReplies: false,
    reset: () => {},
  };
}

/** Chosen once per build from the environment, so the hook order never changes. */
export const useAppData: () => AppDataSource = isRemote
  ? useRemoteData
  : useLocalData;
