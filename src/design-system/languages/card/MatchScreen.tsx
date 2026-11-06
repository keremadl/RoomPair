"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Send, Sparkles } from "@/design-system/icons";
import { Chip } from "@/design-system/components/Chip/Chip";
import { IconButton } from "@/design-system/components/IconButton/IconButton";
import { motionTokens } from "@/design-system/components/Motion/Motion";
import { useText } from "@/design-system/text/TextProvider";
import m from "./match.module.css";

export type MatchPerson = { name: string; age?: number; photo: string };

/**
 * The full-screen "Team up!" moment after a mutual like. Two character cards
 * slide in from the sides and lock together, a heart badge pops, the title
 * lands like the swipe stamp, then a message box and quick starters. Timing
 * comes from the motion tokens, so reduced motion shows it all at once.
 * Put it in a full-screen Dialog for focus handling and Escape.
 */
export function MatchScreen({
  you,
  them,
  fit,
  place,
  starters,
  onSend,
  onClose,
}: {
  you: MatchPerson;
  them: MatchPerson;
  /** The % fit between you. */
  fit: number;
  /** Their room, when you are looking for one. */
  place?: { price: number; area: string };
  /** One-tap first messages. */
  starters: string[];
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const t = useText();
  const [text, setText] = useState("");
  const tk = motionTokens();
  const still = tk.page === 0;
  // Delays scale with the page duration, so reduced motion makes them 0.
  const at = (n: number) => (still ? 0 : tk.page * n);
  const slide = { duration: tk.page * 1.6, ease: tk.easePage };
  const card = (side: -1 | 1, p: MatchPerson) => (
    <motion.figure
      className={m.card}
      data-side={side < 0 ? "left" : "right"}
      initial={
        still ? false : { x: `${side * 70}vw`, rotate: side * 24, opacity: 0 }
      }
      animate={{ x: 0, rotate: side * 7, opacity: 1 }}
      transition={slide}
    >
      <img src={p.photo} alt="" />
      <figcaption className={m.tag}>
        {p.name}
        {p.age ? `, ${p.age}` : ""}
      </figcaption>
    </motion.figure>
  );
  const rise = (delay: number) => ({
    initial: still ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: tk.page, ease: tk.ease, delay: at(delay) },
  });
  return (
    <div className={m.screen}>
      <div className={m.rings} aria-hidden="true" />
      <div className={m.cards}>
        {card(-1, you)}
        {card(1, them)}
        <motion.span
          className={m.heart}
          aria-hidden="true"
          initial={still ? false : { scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: still ? false : "spring",
            stiffness: 420,
            damping: 14,
            delay: at(1.5),
          }}
        >
          <Heart />
        </motion.span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={m.spark}
            data-spark={i}
            aria-hidden="true"
            initial={still ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: tk.page,
              ease: tk.easePage,
              delay: at(1.8 + i * 0.3),
            }}
          >
            <Sparkles />
          </motion.span>
        ))}
      </div>

      <motion.h2
        className={m.title}
        initial={still ? false : { scale: 1.8, rotate: -14, opacity: 0 }}
        animate={{ scale: 1, rotate: -4, opacity: 1 }}
        transition={{
          type: still ? false : "spring",
          stiffness: 380,
          damping: 16,
          delay: at(2),
        }}
      >
        {t("Team up!")}
      </motion.h2>

      <motion.div className={m.lead} {...rise(2.6)}>
        <p>
          {t("You and {name} both want to live together.", {
            name: them.name,
          })}
        </p>
        <p className={m.facts}>
          <span className={m.fact}>
            {fit}% {t("fit")}
          </span>
          {place && (
            <span className={m.fact}>
              €{place.price}
              {t("/month")} · {place.area}
            </span>
          )}
        </p>
      </motion.div>

      <motion.form
        className={m.compose}
        {...rise(3)}
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) onSend(text.trim());
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("Say hi to {name}", { name: them.name })}
          aria-label={t("Say hi to {name}", { name: them.name })}
          maxLength={2000}
        />
        <IconButton
          type="submit"
          variant="outline"
          label={t("Send")}
          icon={<Send />}
          disabled={!text.trim()}
        />
      </motion.form>

      <motion.div
        className={m.starters}
        role="group"
        aria-label={t("Quick starters")}
        {...rise(3.3)}
      >
        {starters.map((s) => (
          <Chip key={s} onClick={() => onSend(s)}>
            {s}
          </Chip>
        ))}
      </motion.div>

      <motion.button
        type="button"
        className={m.later}
        onClick={onClose}
        {...rise(3.6)}
      >
        {t("Keep swiping")}
      </motion.button>
    </div>
  );
}
