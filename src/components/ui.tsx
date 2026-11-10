"use client";
import { useEffect, useRef } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand ${small ? "brand-small" : ""}`}>
      <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <path
          d="M4 34V17a11 11 0 0 1 22 0v17h-8V17a3 3 0 0 0-6 0v17Z"
          fill="currentColor"
        />
        <path
          d="M20 34V17a11 11 0 0 1 22 0v17h-8V17a3 3 0 0 0-6 0v17Z"
          fill="#e79976"
        />
      </svg>
      <span>
        roompair<span className="brand-dot">.</span>
      </span>
    </span>
  );
}
export function HomeIllustration() {
  return (
    <svg
      className="home-illustration"
      viewBox="0 0 320 185"
      fill="none"
      aria-hidden="true"
    >
      <path d="M31 167h263" stroke="#98aaa0" />
      <path
        d="M91 126V27h112v99"
        fill="#f9f4e9"
        stroke="#42695a"
        strokeWidth="2"
      />
      <path d="M147 28v98M92 76h110" stroke="#42695a" strokeWidth="2" />
      <path
        d="M102 29c-1 35-2 60-18 89M192 29c1 35 2 60 18 89"
        stroke="#d8bd95"
        strokeWidth="13"
      />
      <path d="M93 127h126v30H93z" fill="#dc9674" />
      <rect x="77" y="109" width="158" height="45" rx="12" fill="#edb094" />
      <path d="M78 132h156" stroke="#bf7d5e" />
      <path d="M85 154v13m142-13v13" stroke="#42695a" strokeWidth="4" />
      <rect x="94" y="113" width="34" height="25" rx="5" fill="#f8ebce" />
      <rect x="179" y="113" width="34" height="25" rx="5" fill="#7e9a80" />
      <path
        d="M258 143v-45m0 20c-24 0-28-19-28-19 24-3 28 19 28 19Zm0-9c24-8 22-26 22-26-24 2-22 26-22 26Z"
        fill="#638570"
        stroke="#42695a"
        strokeWidth="2"
      />
      <path d="m244 141 5 26h19l5-26" fill="#b9c5aa" />
      <path
        d="M54 166V86m-22 0h44L65 55H43Z"
        stroke="#42695a"
        strokeWidth="2"
        fill="#eedbb3"
      />
      <ellipse cx="155" cy="165" rx="58" ry="9" fill="#d6dbcc" />
      <path
        d="M127 161h57m-50 0-3 12m46-12 3 12"
        stroke="#42695a"
        strokeWidth="2"
      />
      <path d="M119 157h73v6h-73z" fill="#ba9872" />
    </svg>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input,select,textarea,[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
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
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal ${wide ? "modal-wide" : ""} ${className}`}
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <button
          aria-label={t("Close dialog")}
          className="icon-button modal-close"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  label,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  action?: () => void;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={32} />
      </span>
      <h2>{title}</h2>
      <p>{body}</p>
      {action && (
        <button className="button primary" onClick={action}>
          {label}
          <ArrowUpRight size={17} />
        </button>
      )}
    </div>
  );
}
