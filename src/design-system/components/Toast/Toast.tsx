"use client";
import { AnimatePresence, motion } from "motion/react";
import { motionTokens } from "../Motion/Motion";
import styles from "./Toast.module.css";

/** A short status message. Always rendered so screen readers hear changes. */
export function Toast({ message }: { message: string }) {
  const m = motionTokens();
  return (
    <div className={styles.region} role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message}
            className={styles.toast}
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: m.page, ease: m.easePage },
            }}
            exit={{
              opacity: 0,
              y: 8,
              transition: { duration: m.base, ease: m.easeExit },
            }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
