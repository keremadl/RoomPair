/**
 * RoomPair lab: the app and the design-system library outside Next.js,
 * for testing in a phone frame. window.__LAB_VIEW picks what to render.
 */
import "@/design-system/tokens.css";
import "@/app/globals.css";
import "./lab.css";
import { createRoot } from "react-dom/client";
import RoomPair from "@/components/app/RoomPairApp";
import { Showcase } from "@/app/design-system/showcase";

const view = (window as unknown as { __LAB_VIEW?: string }).__LAB_VIEW;
createRoot(document.getElementById("root")!).render(
  view === "library" ? <Showcase /> : <RoomPair />,
);
