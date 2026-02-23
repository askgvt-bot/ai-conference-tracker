import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "AI Conference Tracker",
  description: "300 AI conferences worldwide, scored & ranked",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
