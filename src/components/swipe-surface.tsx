"use client";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useI18n } from "@/lib/i18n";

/** Every card owns its motion values, so an entering card cannot interrupt an exit. */
export function SwipeSurface({
  children,
  onDecision,
}: {
  children: React.ReactNode;
  onDecision: (action: "like" | "pass") => void;
}) {
  const { t } = useI18n();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-16, 16]);
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -20], [1, 0]);
  return (
    <motion.article
      className="swipe-card"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      onDragEnd={(_, info) => {
        if (info.offset.x > 95 || info.velocity.x > 650) onDecision("like");
        else if (info.offset.x < -95 || info.velocity.x < -650)
          onDecision("pass");
      }}
      variants={{
        enter: { opacity: 1, scale: 1, y: 0 },
        exit: (direction: number) => ({
          x: direction * 650,
          rotate: direction * 18,
          opacity: 0,
          transition: { duration: 0.28, ease: "easeIn" },
        }),
      }}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate="enter"
      exit="exit"
      transition={{ type: "spring", stiffness: 280, damping: 29 }}
    >
      {children}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="swipe-stamp like-stamp"
      >
        {t("ROOMMATE?")}
      </motion.div>
      <motion.div
        style={{ opacity: passOpacity }}
        className="swipe-stamp pass-stamp"
      >
        {t("PASS")}
      </motion.div>
    </motion.article>
  );
}
