"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { motionTokens } from "../Motion/Motion";
import { X } from "../../icons";
import { cx } from "../../cx";
import { useText } from "../../text/TextProvider";
import styles from "./Dialog.module.css";

/**
 * How many dialogs are open. Two overlap whenever one opens while another is
 * still animating out; if each remembered and restored the page's scroll
 * setting on its own, the second would remember "locked" and leave the page
 * unscrollable for good. So only the first lock and the last unlock count.
 */
let openDialogs = 0;
let overflowBeforeLock = "";
function lockPageScroll() {
  if (openDialogs === 0) {
    overflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openDialogs += 1;
}
function unlockPageScroll() {
  openDialogs = Math.max(0, openDialogs - 1);
  if (openDialogs === 0) document.body.style.overflow = overflowBeforeLock;
}

export type DialogProps = {
  /** Accessible name; also shown as the heading unless `hideTitle`. */
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** "full" covers the whole screen; the content brings its own layout. */
  size?: "md" | "lg" | "full";
  hideTitle?: boolean;
  /** No close (×) button: the content offers its own way out. Escape still closes. */
  hideClose?: boolean;
  className?: string;
};

/**
 * Modal dialog: traps focus, closes on Escape and on a backdrop click,
 * locks page scroll and returns focus to where it was. Wrap in
 * <AnimatePresence> for the exit animation.
 */
export function Dialog({
  title,
  onClose,
  children,
  size = "md",
  hideTitle = false,
  hideClose = false,
  className,
}: DialogProps) {
  const t = useText();
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    lockPageScroll();
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key !== "Tab") return;
      const nodes = ref.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex="0"],summary',
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unlockPageScroll();
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);
  // Timing from the motion tokens (0 under reduced motion).
  const m = motionTokens();
  return (
    <motion.div
      className={cx(styles.backdrop, size === "full" && styles.fullBackdrop)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: m.base, ease: m.ease }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(styles.dialog, styles[size], className)}
        initial={{ y: 24, scale: 0.98 }}
        animate={{
          y: 0,
          scale: 1,
          transition: { duration: m.page, ease: m.easePage },
        }}
        exit={{
          y: 16,
          opacity: 0,
          transition: { duration: m.base, ease: m.easeExit },
        }}
      >
        {!hideClose && (
          <button
            type="button"
            className={styles.close}
            aria-label={t("Close dialog")}
            onClick={onClose}
          >
            <X />
          </button>
        )}
        {!hideTitle && <h2 className={styles.title}>{title}</h2>}
        {children}
      </motion.div>
    </motion.div>
  );
}
