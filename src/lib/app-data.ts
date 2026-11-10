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
import { profiles as demoProfiles, rooms as demoRooms } from "./data";
import { initialState, useAppState, type AppState } from "./store";
import type { Profile, Room } from "./types";
import { getClient, isRemote } from "./backend/client";
import { appDataFromSnapshot, type AppData } from "./backend/mapping";
import { applyOperation, loadSnapshot } from "./backend/remote";
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
  rooms: Room[];
  /** Null in the browser-only demo, which has no accounts. */
  account: Account | null;
  /** Demo people answer with canned replies; real members answer for themselves. */
  simulatesReplies: boolean;
  reset: () => void;
}

/** The self-contained demo: fictional people, state kept in this browser. */
function useLocalData(): AppDataSource {
  const { state, setState, ready, reset, storageFailed } = useAppState();
  return {
    state,
    setState,
    ready,
    saveFailed: storageFailed,
    profiles: demoProfiles,
    rooms: demoRooms,
    account: null,
    simulatesReplies: true,
    reset,
  };
}

const emptyData: AppData = {
  state: initialState,
  profiles: [],
  rooms: [],
  matchIds: {},
};
const POLL_INTERVAL = 6000;

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
      const next = appDataFromSnapshot(await loadSnapshot(client, id));
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

  // New likes, matches and messages arrive by polling while the tab is open.
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        !sending.current &&
        !queue.current.length
      )
        void refresh();
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [user, refresh]);

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
    }),
    [client, user],
  );

  return {
    state: data.state,
    setState,
    ready: user === null || (user !== undefined && loaded),
    saveFailed,
    profiles: data.profiles,
    rooms: data.rooms,
    account,
    simulatesReplies: false,
    reset: () => {},
  };
}

/** Chosen once per build from the environment, so the hook order never changes. */
export const useAppData: () => AppDataSource = isRemote
  ? useRemoteData
  : useLocalData;
