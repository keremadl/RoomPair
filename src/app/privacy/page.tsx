import type { Metadata } from "next";
import { PrivacyPage } from "@/components/app/PrivacyPage";

export const metadata: Metadata = { title: "Privacy notice — RoomPair" };

export default function Page() {
  return <PrivacyPage />;
}
