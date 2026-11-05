import type { Metadata } from "next";
import { Directions } from "./directions";

export const metadata: Metadata = {
  title: "RoomPair — Design directions",
  robots: { index: false },
};

export default function DirectionsPage() {
  return <Directions />;
}
