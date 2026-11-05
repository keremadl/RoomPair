"use client";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Toast.module.css";

/** A short status message. Always rendered so screen readers hear changes. */
export function Toast({ message }: { message: string }) {
  return (
    <div className={styles.region} role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message}
            className={styles.toast}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
