import type { Metadata } from "next";
import { Showcase } from "./showcase";

export const metadata: Metadata = {
  title: "RoomPair — Design system",
  robots: { index: false },
};

export default function DesignSystemPage() {
  return <Showcase />;
}
