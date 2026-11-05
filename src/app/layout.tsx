import type { Metadata, Viewport } from "next";
import "@/design-system/tokens.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "RoomPair — Good people. Better living.",
  description:
    "Find your people. Share your space. A thoughtful way to find a roommate.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f8f4",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
