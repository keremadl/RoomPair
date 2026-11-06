import type { Metadata } from "next";
import { directionFontVariables } from "@/design-system/languages";
import { Variants } from "./variants";

export const metadata: Metadata = {
  title: "RoomPair — Swipe variants",
  robots: { index: false },
};

export default function SwipeVariantsPage() {
  return (
    <div className={directionFontVariables}>
      <Variants />
    </div>
  );
}
