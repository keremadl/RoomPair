/**
 * RoomPair · Card icon set. Every path is drawn by hand on a 24×24 grid:
 * live area 3–21 (2px+ safe area once the stroke is added), corner radius
 * 2.5–3 on boxes, round caps and joins, solid accents only as small
 * currentColor dots. Names match the lucide icons they replace.
 */
import { createIcon } from "./Icon";

/** Solid accent dot (fill = currentColor, no stroke). */
const Dot = ({ x, y, r = 1.3 }: { x: number; y: number; r?: number }) => (
  <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />
);

/* ── Arrows & chevrons ─────────────────────────────── */

export const ArrowLeft = createIcon(
  "ArrowLeft",
  <path d="M10.5 6.5 5 12l5.5 5.5M5.5 12H19" />,
);
export const ArrowRight = createIcon(
  "ArrowRight",
  <path d="M13.5 6.5 19 12l-5.5 5.5M18.5 12H5" />,
);
export const ArrowUpRight = createIcon(
  "ArrowUpRight",
  <path d="M9.5 6.5h8v8M17 7 6.5 17.5" />,
);
export const ChevronDown = createIcon(
  "ChevronDown",
  <path d="M6.5 9.5 12 15l5.5-5.5" />,
);
export const ChevronLeft = createIcon(
  "ChevronLeft",
  <path d="M14.5 6.5 9 12l5.5 5.5" />,
);
export const ChevronRight = createIcon(
  "ChevronRight",
  <path d="M9.5 6.5 15 12l-5.5 5.5" />,
);
export const RotateCcw = createIcon(
  "RotateCcw",
  <>
    <path d="M5.8 8.2A7.5 7.5 0 1 1 4.5 12.5" />
    <path d="M4.5 4.5v4.25h4.25" />
  </>,
);

/* ── Marks ─────────────────────────────────────────── */

export const Check = createIcon("Check", <path d="M5 12.5 9.5 17 19 7.5" />);
export const CheckCheck = createIcon(
  "CheckCheck",
  <path d="M2.75 12.75 6.5 16.5 14.5 8.5M12.25 15.75l.75.75 8-8" />,
);
export const X = createIcon("X", <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />);
export const Plus = createIcon("Plus", <path d="M12 5.5v13M5.5 12h13" />);
export const Minus = createIcon("Minus", <path d="M5.5 12h13" />);
export const Circle = createIcon("Circle", <circle cx="12" cy="12" r="8.75" />);
export const Ban = createIcon(
  "Ban",
  <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M6.25 6.25l11.5 11.5" />
  </>,
);
export const Info = createIcon(
  "Info",
  <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M12 11.25v5" />
    <Dot x={12} y={7.9} r={1.45} />
  </>,
);
export const CircleHelp = createIcon(
  "CircleHelp",
  <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.35c-.6.25-1 .8-1 1.45v.3" />
    <Dot x={12} y={16.9} r={1.45} />
  </>,
);
export const MoreHorizontal = createIcon(
  "MoreHorizontal",
  <>
    <Dot x={5.75} y={12} r={1.9} />
    <Dot x={12} y={12} r={1.9} />
    <Dot x={18.25} y={12} r={1.9} />
  </>,
);
export const Text = createIcon(
  "Text",
  <path d="M4.5 6.5h15M4.5 12h15M4.5 17.5h9" />,
);
export const ListChecks = createIcon(
  "ListChecks",
  <>
    <path d="M3.5 6.5 5.25 8.25 8.5 5M3.5 12.5l1.75 1.75L8.5 11" />
    <circle cx="5.75" cy="18.25" r="1.75" />
    <path d="M12 6.5h8.5M12 12.5h8.5M12 18.25h8.5" />
  </>,
);
export const SlidersHorizontal = createIcon(
  "SlidersHorizontal",
  <>
    <path d="M3.5 7.5h8M18.5 7.5h2M3.5 16.5h2M12.5 16.5h8" />
    <circle cx="15.25" cy="7.5" r="2.75" />
    <circle cx="8.75" cy="16.5" r="2.75" />
  </>,
);
export const Search = createIcon(
  "Search",
  <>
    <circle cx="10.5" cy="10.5" r="6.75" />
    <path d="M15.5 15.5l5 5" />
    <path d="M7.75 9.75a2.75 2.75 0 0 1 2-2" />
  </>,
);

/** Shared outline: plump heart (Heart, HeartHandshake). */
const heart =
  "M12 20s-8.25-4.75-8.25-10.75A4.5 4.5 0 0 1 12 6.5a4.5 4.5 0 0 1 8.25 2.75C20.25 15.25 12 20 12 20z";

/* ── People ────────────────────────────────────────── */

export const UserRound = createIcon(
  "UserRound",
  <>
    <circle cx="12" cy="8.25" r="4.25" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </>,
);
export const Users = createIcon(
  "Users",
  <>
    <circle cx="9" cy="8.5" r="3.75" />
    <path d="M2.75 20a6.25 6.25 0 0 1 12.5 0" />
    <path d="M15 4.95a3.75 3.75 0 0 1 0 7.1M17.75 14.4A6.25 6.25 0 0 1 21.25 20" />
  </>,
);
export const UserPen = createIcon(
  "UserPen",
  <>
    <circle cx="10" cy="8" r="4" />
    <path d="M3.5 20.5a6.5 6.5 0 0 1 8.5-6.2" />
    <path d="M18.2 12.6a1.6 1.6 0 0 1 2.3 2.3l-5.1 5.1-3 .6.6-3z" />
  </>,
);
export const Smile = createIcon(
  "Smile",
  <>
    <circle cx="12" cy="12" r="8.75" />
    <Dot x={9} y={10} r={1.35} />
    <Dot x={15} y={10} r={1.35} />
    <path d="M8.5 14a4 4 0 0 0 7 0" />
  </>,
);
export const Handshake = createIcon(
  "Handshake",
  <>
    {/* Two sleeves (cuffs) and the clasped hands between them. */}
    <path d="M2.75 6.5v8.5M21.25 6.5v8.5" />
    <path d="M2.75 8h4.5l2.5 1.25" />
    <path d="M21.25 8H16.5l-4.75 4a1.75 1.75 0 0 0 2.25 2.65L16 13l3.25 2.75h2" />
    <path d="M2.75 13.5h1.5l4.5 4.25a1.75 1.75 0 0 0 2.5-.1l3.5-3.4" />
  </>,
);
export const HeartHandshake = createIcon(
  "HeartHandshake",
  <>
    {/* A match: a heart with a tick. */}
    <path d={heart} />
    <path d="M8.75 11.75l2.25 2.25 4.25-4.25" />
  </>,
);

/* ── Feelings & rewards ────────────────────────────── */

export const Heart = createIcon(
  "Heart",
  <>
    <path d={heart} />
  </>,
);
export const Star = createIcon(
  "Star",
  <>
    <path d="M12 3.25 14.62 8.9 20.8 9.65 16.25 13.9 17.43 20.03 12 17.05 6.57 20.03 7.75 13.9 3.2 9.65 9.38 8.9z" />
  </>,
);
export const Sparkles = createIcon(
  "Sparkles",
  <>
    <path d="M10 3.75c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6z" />
    <path
      d="M18 14.3l.71 2.49 2.49.71-2.49.71L18 20.7l-.71-2.49-2.49-.71 2.49-.71z"
      fill="currentColor"
      strokeWidth="1"
    />
    <Dot x={18.5} y={4.75} r={1.35} />
  </>,
);
export const Trophy = createIcon(
  "Trophy",
  <>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H5.5a2.25 2.25 0 0 0 0 4.5H7.4M17 6h1.5a2.25 2.25 0 0 1 0 4.5h-1.9" />
    <path d="M12 14v3.5M8 20.5a2.5 2.5 0 0 1 2.5-2.5h3a2.5 2.5 0 0 1 2.5 2.5z" />
  </>,
);
export const BadgeCheck = createIcon(
  "BadgeCheck",
  <>
    <path d="M12 3.1Q14.76 5.35 18.29 5.71Q18.65 9.24 20.9 12Q18.65 14.76 18.29 18.29Q14.76 18.65 12 20.9Q9.24 18.65 5.71 18.29Q5.35 14.76 3.1 12Q5.35 9.24 5.71 5.71Q9.24 5.35 12 3.1Z" />
    <path d="M8.75 12.25l2.25 2.25 4.25-4.75" />
  </>,
);
export const PartyPopper = createIcon(
  "PartyPopper",
  <>
    <path d="M3.75 20.25 8.5 8.75l6.75 6.75z" />
    <path d="M13.5 10.5c1.75-1.75 4-2 6.5-.75" />
    <Dot x={14.5} y={4.5} r={1.5} />
    <Dot x={19.75} y={15.5} r={1.5} />
  </>,
);
export const Flag = createIcon(
  "Flag",
  <>
    <path d="M5.5 20.5V3.75" />
    <path d="M5.5 4.5h12.75l-3 4.5 3 4.5H5.5" />
  </>,
);

/* ── Safety & trust ────────────────────────────────── */

const shield =
  "M12 3.5 18.75 6v5.5c0 4.4-2.8 7.6-6.75 9-3.95-1.4-6.75-4.6-6.75-9V6z";
export const ShieldCheck = createIcon(
  "ShieldCheck",
  <>
    <path d={shield} />
    <path d="M9 12.25l2 2 4-4.25" />
  </>,
);
export const ShieldBan = createIcon(
  "ShieldBan",
  <>
    <path d={shield} />
    <path d="M8.75 12.25h6.5" />
  </>,
);
export const Key = createIcon(
  "Key",
  <>
    <circle cx="7.5" cy="12" r="4.25" />
    <path d="M11.75 12h8.75M17.25 12v3M20.25 12v2.25" />
    <Dot x={7.5} y={12} r={1.2} />
  </>,
);
export const KeyRound = createIcon(
  "KeyRound",
  <>
    <circle cx="15" cy="9" r="5.5" />
    <path d="M11 13 4 20M6.75 17.25l2 2M4 20l1.5 1.25" />
    <Dot x={16.5} y={7.5} r={1.4} />
  </>,
);

/* ── Home & places ─────────────────────────────────── */

export const Home = createIcon(
  "Home",
  <>
    <path d="M2.75 11.25 12 3.75l9.25 7.5" />
    <path d="M5.25 9.5v9A2.5 2.5 0 0 0 7.75 21h8.5a2.5 2.5 0 0 0 2.5-2.5v-9" />
    <path d="M10 21v-4.5a2 2 0 0 1 4 0V21" />
  </>,
);
export const Building2 = createIcon(
  "Building2",
  <>
    <path d="M4.5 21V5.5A2.5 2.5 0 0 1 7 3h5.5A2.5 2.5 0 0 1 15 5.5V21" />
    <path d="M15 10h2.5a2.5 2.5 0 0 1 2.5 2.5V21M3 21h18" />
    <path d="M8 7.5h3.5M8 11.5h3.5M8 15.5h3.5" />
  </>,
);
export const DoorOpen = createIcon(
  "DoorOpen",
  <>
    <path d="M3 21h18" />
    <path d="M13.5 4.5h3A2.5 2.5 0 0 1 19 7v14" />
    <path d="M5 21V4.25l8.5 1.5V21" />
    <Dot x={10.75} y={13.25} />
  </>,
);
export const MapPin = createIcon(
  "MapPin",
  <>
    <path d="M12 21s-7-5.9-7-11.5a7 7 0 0 1 14 0C19 15.1 12 21 12 21z" />
    <Dot x={12} y={9.5} r={2.2} />
  </>,
);
export const Compass = createIcon(
  "Compass",
  <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M15.5 8.5 13.6 13.6 8.5 15.5l1.9-5.1z" />
  </>,
);
export const Bus = createIcon(
  "Bus",
  <>
    <rect x="4.5" y="3" width="15" height="15" rx="3.5" />
    <path d="M4.5 11h15M9.5 6.25h5M7.5 18v2.5M16.5 18v2.5" />
    <Dot x={8.25} y={14.5} />
    <Dot x={15.75} y={14.5} />
  </>,
);
export const Sofa = createIcon(
  "Sofa",
  <>
    <path d="M5.25 11V8.5A2.5 2.5 0 0 1 7.75 6h8.5a2.5 2.5 0 0 1 2.5 2.5V11" />
    <path d="M7 15.25h10V13.5a2 2 0 1 1 4 0V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3.5a2 2 0 1 1 4 0z" />
    <path d="M6 19v1.75M18 19v1.75" />
  </>,
);
export const Bath = createIcon(
  "Bath",
  <>
    <path d="M3 12h18" />
    <path d="M4.5 12v1.75A5.25 5.25 0 0 0 9.75 19h4.5a5.25 5.25 0 0 0 5.25-5.25V12" />
    <path d="M7.5 19l-1 2M16.5 19l1 2" />
    <path d="M7 12V6.25a2.5 2.5 0 0 1 4.75-1.1" />
    <Dot x={13} y={8.5} r={1.2} />
  </>,
);
export const Leaf = createIcon(
  "Leaf",
  <>
    <path d="M5.25 18.75C4.75 10 10 4.75 19.75 4.25 19.25 14 14 19.25 5.25 18.75z" />
    <path d="M3.5 20.5l9-9" />
  </>,
);
export const Sun = createIcon(
  "Sun",
  <>
    <circle cx="12" cy="12" r="3.75" />
    <path d="M12 5.25V3.5M16.77 7.23l1.24-1.24M18.75 12h1.75M16.77 16.77l1.24 1.24M12 18.75v1.75M7.23 16.77l-1.24 1.24M5.25 12H3.5M7.23 7.23 5.99 5.99" />
  </>,
);
/** Follow the device's light/dark setting: a circle, half filled. */
export const Contrast = createIcon(
  "Contrast",
  <>
    <circle cx="12" cy="12" r="8.75" />
    <path
      d="M12 3.25a8.75 8.75 0 0 1 0 17.5z"
      fill="currentColor"
      stroke="none"
    />
  </>,
);
export const Moon = createIcon(
  "Moon",
  <>
    <path d="M19.25 14.75A7.75 7.75 0 1 1 9.25 4.75a6.25 6.25 0 0 0 10 10z" />
    <Dot x={17.25} y={5.5} r={1.25} />
  </>,
);
export const PawPrint = createIcon(
  "PawPrint",
  <>
    <path d="M7.75 17.5c0-2.75 1.9-4.75 4.25-4.75s4.25 2 4.25 4.75c0 1.65-1.5 2.75-4.25 2.75s-4.25-1.1-4.25-2.75z" />
    <Dot x={5.25} y={11} r={2} />
    <Dot x={9.25} y={6.5} r={2} />
    <Dot x={14.75} y={6.5} r={2} />
    <Dot x={18.75} y={11} r={2} />
  </>,
);
export const Cigarette = createIcon(
  "Cigarette",
  <>
    <rect x="3" y="14.5" width="18" height="4.5" rx="2" />
    <path d="M15.5 14.5V19" />
    <path d="M18.5 11.5c-1-1-1-2 0-3s1-2 0-3" />
  </>,
);
export const Volume2 = createIcon(
  "Volume2",
  <>
    <path d="M3.5 9.5v5H7l4.5 4v-13L7 9.5z" />
    <path d="M15 9.25a3.9 3.9 0 0 1 0 5.5M17.75 6.5a7.75 7.75 0 0 1 0 11" />
  </>,
);

/* ── Things & items ────────────────────────────────── */

export const Backpack = createIcon(
  "Backpack",
  <>
    <path d="M9.5 8V6a2.5 2.5 0 0 1 5 0v2" />
    <rect x="5" y="8" width="14" height="13" rx="4" />
    <path d="M8.5 21v-4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v4" />
  </>,
);
export const Bell = createIcon(
  "Bell",
  <>
    <path d="M6 16.25V11a6 6 0 0 1 12 0v5.25l1.5 2.25h-15z" />
    <path d="M10.25 21.25h3.5M12 3.25V5" />
  </>,
);
const bookmark =
  "M6.5 5.75A2.5 2.5 0 0 1 9 3.25h6a2.5 2.5 0 0 1 2.5 2.5v14.5l-5.5-4-5.5 4z";
export const Bookmark = createIcon("Bookmark", <path d={bookmark} />);
export const BookmarkCheck = createIcon(
  "BookmarkCheck",
  <>
    <path d={bookmark} />
    <path d="M9.5 9.75l1.75 1.75 3.25-3.5" />
  </>,
);
export const CalendarDays = createIcon(
  "CalendarDays",
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M8 3v3.5M16 3v3.5M3.5 10h17" />
    <Dot x={8} y={14} />
    <Dot x={12} y={14} />
    <Dot x={16} y={14} />
    <Dot x={8} y={17.25} />
    <Dot x={12} y={17.25} />
  </>,
);
export const Clock = createIcon(
  "Clock",
  <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M12 7.5V12l3 2" />
  </>,
);
export const ImagePlus = createIcon(
  "ImagePlus",
  <>
    <path d="M20.5 12.5v5a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3h6" />
    <path d="M3.75 17 8 12.75l3 3 2-2 4.25 4.25" />
    <path d="M18 3v6M15 6h6" />
    <Dot x={8.5} y={8.25} r={1.5} />
  </>,
);
export const Languages = createIcon(
  "Languages",
  <>
    {/* A speech bubble with a letter. */}
    <path d="M6 3.75h12a2.75 2.75 0 0 1 2.75 2.75v7.75A2.75 2.75 0 0 1 18 17h-6.5l-5 3.75V17H6a2.75 2.75 0 0 1-2.75-2.75V6.5A2.75 2.75 0 0 1 6 3.75z" />
    <path d="M9 13.5l3-7 3 7M10.25 11h3.5" />
  </>,
);
export const MessageCircle = createIcon(
  "MessageCircle",
  <path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.55L3.5 20.5l1.05-4.4A8.5 8.5 0 1 1 20.5 12z" />,
);
export const MessageSquareQuote = createIcon(
  "MessageSquareQuote",
  <>
    <path d="M6.5 3.5h11a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H10l-4.5 3.5v-3.6a3 3 0 0 1-2-2.9v-8a3 3 0 0 1 3-3z" />
    <path d="M9.5 9v1.5c0 .9-.4 1.6-1 2M14.5 9v1.5c0 .9-.4 1.6-1 2" />
  </>,
);
export const PiggyBank = createIcon(
  "PiggyBank",
  <>
    <ellipse cx="11.25" cy="12.5" rx="7.25" ry="6.25" />
    <path d="M18.5 11h2v3.25h-2M8 18.25v2.25M14.5 18.25v2.25M9.25 8.75h4" />
    <Dot x={15} y={11} r={1.25} />
  </>,
);
export const Receipt = createIcon(
  "Receipt",
  <>
    <path d="M6 3.5h12v17l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5z" />
    <path d="M9 8h6M9 11.5h6M9 15h3.5" />
  </>,
);
export const ScrollText = createIcon(
  "ScrollText",
  <>
    <path d="M16.5 8.5V18a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5v-1.5H7" />
    <path d="M7 16.5V6a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 21 6v2.5h-4.5" />
    <path d="M10.5 8.5H13M10.5 12.5H13" />
  </>,
);
export const Send = createIcon(
  "Send",
  <path d="M20.5 3.5 3.5 10.25l7 3.25 3.25 7zM10.5 13.5l4-4" />,
);
export const Settings = createIcon(
  "Settings",
  <>
    <path d="M9.73 5.48 10.13 3.2h3.74l.4 2.28 2.24 1.3 2.18-.8 1.87 3.24-1.78 1.49v2.58l1.78 1.49-1.87 3.24-2.18-.8-2.24 1.3-.4 2.28h-3.74l-.4-2.28-2.24-1.3-2.18.8-1.87-3.24 1.78-1.49v-2.58L3.44 9.22l1.87-3.24 2.18.8z" />
    <circle cx="12" cy="12" r="2.75" />
  </>,
);
export const Tag = createIcon(
  "Tag",
  <>
    <path d="M3.5 5.5v5.2a2 2 0 0 0 .6 1.4l7.8 7.8a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8L12.1 4.1a2 2 0 0 0-1.4-.6H5.5a2 2 0 0 0-2 2z" />
    <Dot x={8} y={8} r={1.5} />
  </>,
);
export const Trash2 = createIcon(
  "Trash2",
  <>
    <path d="M4 6.5h16M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
    <path d="M6 6.5l.8 12.2a2 2 0 0 0 2 1.8h6.4a2 2 0 0 0 2-1.8L18 6.5" />
    <path d="M10 10.5v6M14 10.5v6" />
  </>,
);
export const Wallet = createIcon(
  "Wallet",
  <>
    <path d="M18 7.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6" />
    <path d="M3.5 6v12A2.5 2.5 0 0 0 6 20.5h12a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 18 7.5H6A2.5 2.5 0 0 1 3.5 5" />
    <path d="M20.5 11.5H17a2 2 0 0 0 0 4h3.5" />
  </>,
);
