"use client";
import type { ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type TargetAndTransition,
} from "motion/react";
/** What a swipe decides. */
export type Decision = "like" | "pass";

type Stamp = { className: string; label: ReactNode };

/**
 * The draggable part of a profile. Each design language decides how it looks,
 * how far it tilts, how it springs and how it leaves.
 */
export function SwipeHero({
  children,
  className,
  onDecision,
  tilt = 14,
  spring = { stiffness: 280, damping: 28 },
  exit,
  stamps,
}: {
  children: ReactNode;
  className?: string;
  onDecision: (d: Decision) => void;
  tilt?: number;
  spring?: { stiffness: number; damping: number };
  exit: (direction: number) => TargetAndTransition;
  stamps?: { like: Stamp; pass: Stamp };
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-tilt, tilt]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -20], [1, 0]);
  return (
    <motion.div
      className={className}
      style={{ x, rotate, touchAction: "pan-y" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 || info.velocity.x > 650) onDecision("like");
        else if (info.offset.x < -100 || info.velocity.x < -650)
          onDecision("pass");
      }}
      variants={{ exit }}
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit="exit"
      transition={{ type: "spring", ...spring }}
    >
      {children}
      {stamps && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className={stamps.like.className}
          >
            {stamps.like.label}
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className={stamps.pass.className}
          >
            {stamps.pass.label}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/** Kept here for older imports; it lives with the other motion primitives. */
export { Reveal } from "../Motion/Motion";
