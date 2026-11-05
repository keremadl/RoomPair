import type { Metadata } from "next";
import { Layouts } from "./layouts";

export const metadata: Metadata = {
  title: "RoomPair — Layout prototypes",
  robots: { index: false },
};

export default function LayoutsPage() {
  return <Layouts />;
}
